import { useEffect, useState } from 'react';
import { autoMatch, createRoom, getRoomInfo, joinRoom, startGame } from './api';

const Button = ({ children, onClick, variant = 'normal', disabled }) => (
  <button className={`entry-button ${variant}`} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

function getRoomIdFromHash(hash) {
  const prefix = '#/room/';
  if (hash.startsWith(prefix)) {
    return hash.slice(prefix.length);
  }
  return null;
}

export default function App() {
  const [page, setPage] = useState('home');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const updateRoute = async () => {
      const roomId = getRoomIdFromHash(window.location.hash);
      if (roomId) {
        setPage('room');
        setCountdown(5);
        if (roomInfo?.roomId === roomId) {
          return;
        }

        setMessage('正在恢复房间信息，请稍候...');
        try {
          const result = await getRoomInfo(roomId);
          setRoomInfo({ roomId: result.roomId, matchedPlayers: result.matchedPlayers || [] });
          setMessage(result.message || '已恢复房间信息。');
        } catch (error) {
          setRoomInfo({ roomId, matchedPlayers: [] });
          setMessage(error.message || '无法恢复房间信息。');
        }
      } else {
        setPage('home');
      }
    };

    updateRoute();
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, [roomInfo]);

  const requestAction = async (action) => {
    setLoading(true);
    setMessage('');
    try {
      const result = await action();
      setMessage(result.message);
      return result;
    } catch (error) {
      setMessage(error.message || '操作失败，请稍后重试。');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMatch = async () => {
    try {
      const result = await requestAction(autoMatch);
      const nextRoomInfo = {
        roomId: result.roomId,
        matchedPlayers: result.matchedPlayers || [],
        status: result.status || 'waiting'
      };
      setRoomInfo(nextRoomInfo);
      setPage('room');
      window.location.hash = `#/room/${result.roomId}`;
    } catch {}
  };

  const handleCreateRoom = async () => {
    try {
      const result = await requestAction(createRoom);
      if (result.roomId) {
        setRoomInfo({ roomId: result.roomId, matchedPlayers: [], status: result.status || 'waiting' });
        setPage('room');
        window.location.hash = `#/room/${result.roomId}`;
      }
    } catch {}
  };

  const handleJoinRoom = async () => {
    const roomId = roomIdInput.trim();
    if (!roomId) {
      setMessage('请输入有效的房间号。');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const result = await joinRoom(roomId);
      setMessage(result.message);
      setRoomInfo({ roomId: result.roomId, matchedPlayers: [], status: result.status || 'waiting' });
      setPage('room');
      window.location.hash = `#/room/${result.roomId}`;
    } catch (error) {
      setMessage(error.message || '加入房间失败，请检查房间号。');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!roomInfo?.roomId) {
      setMessage('当前房间不可用，无法开始游戏。');
      return;
    }
    const result = await requestAction(() => startGame(roomInfo.roomId));
    if (result && !result.error) {
      setRoomInfo((current) => ({ ...current, status: 'started' }));
    }
  };

  const handleReturnHome = () => {
    window.location.hash = '';
    setPage('home');
    setRoomInfo(null);
    setRoomIdInput('');
    setMessage('');
  };

  const renderHome = () => (
    <>
      <div className="decoration home-lantern-top">🏮</div>
      <div className="decoration home-lantern-bottom">🏮</div>
      <div className="decoration home-fu">🧧</div>
      <div className="decoration bomb-icon">💣</div>
      <section className="entry-panel">
        <Button onClick={handleAutoMatch} variant="primary" disabled={loading}>
          自动匹配
        </Button>

        <Button onClick={handleCreateRoom} variant="primary" disabled={loading}>
          创建游戏房间
        </Button>

        <Button
          onClick={() => {
            setPage('join');
            setMessage('');
          }}
          variant="primary"
          disabled={loading}
        >
          进入游戏房间
        </Button>
      </section>

      {page === 'join' && (
        <section className="join-panel">
          <div className="join-card">
            <h2>输入房间号</h2>
            <input
              value={roomIdInput}
              onChange={(event) => setRoomIdInput(event.target.value)}
              placeholder="请输入房间号"
              maxLength={10}
            />
            <div className="join-actions">
              <Button onClick={handleJoinRoom} variant="primary" disabled={loading}>
                加入房间
              </Button>
              <Button
                onClick={() => {
                  setPage('home');
                  setRoomIdInput('');
                  setMessage('');
                }}
                variant="secondary"
                disabled={loading}
              >
                取消
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );

  const renderRoom = () => (
    <section className="room-panel">
      <div className="decoration lantern-left">🏮</div>
      <div className="decoration lantern-right">🏮</div>
      <div className="decoration fu-character">🧧</div>
      <div className="room-card">
        <div className="room-header">
          <p className="room-id">房间号：{roomInfo?.roomId || '未知'}</p>
        </div>

        <div className="room-summary">
          <div className="player-list">
            {roomInfo?.matchedPlayers?.length > 0 ? (
              roomInfo.matchedPlayers.map((player) => (
                <div key={player.id} className="player-card">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`} alt={player.name} className="player-avatar" />
                  <div className="player-meta">
                    <strong>{player.name}</strong>
                    <span>ID: {player.id}</span>
                    <span>{player.level}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-text">
                已进入房间，当前没有可用匹配信息。若要显示玩家信息，请重新进行自动匹配。
              </p>
            )}
          </div>
        </div>

        <div className="room-actions">
          <Button onClick={handleStartGame} variant="primary" disabled={loading || countdown > 0}>
            {countdown > 0 ? `倒计时 ${countdown}秒` : '开始游戏'}
          </Button>
        </div>
      </div>
    </section>
  );

  useEffect(() => {
    if (page === 'room' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [page, countdown]);

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>不要抽到炸弹</h1>
        <p>请选择进入方式：自动匹配、创建房间或输入房间号。</p>
      </header>

      {page === 'room' ? renderRoom() : renderHome()}

      {message && <section className="message-panel">{message}</section>}
    </div>
  );
}
