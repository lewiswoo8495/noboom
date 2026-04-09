const API_BASE = '';

async function request(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message || '后端请求失败。');
  }

  return response.json();
}

export async function autoMatch() {
  try {
    return await request('/auto-match');
  } catch (error) {
    return {
      message: '未能连接后端，已进入模拟自动匹配，等待其他玩家加入。',
      roomId: '',
      matchedPlayers: []
    };
  }
}

export async function createRoom() {
  try {
    return await request('/create-room');
  } catch (error) {
    return {
      message: '未能连接后端，已创建模拟房间，请等待玩家加入。',
      roomId: ''
    };
  }
}

export async function joinRoom(roomId) {
  if (!roomId || !roomId.trim()) {
    throw new Error('请输入有效的房间号。');
  }
  try {
    return await request('/join-room', { roomId });
  } catch (error) {
    return {
      message: `未能连接后端，已模拟加入房间 ${roomId}。`,
      roomId
    };
  }
}

export async function getRoomInfo(roomId) {
  if (!roomId || !roomId.trim()) {
    throw new Error('请输入有效的房间号。');
  }
  try {
    return await request(`/room/${roomId}`);
  } catch (error) {
    return {
      message: `未能恢复房间 ${roomId} 信息。`,
      roomId,
      matchedPlayers: []
    };
  }
}

export async function startGame(roomId) {
  if (!roomId || !roomId.trim()) {
    throw new Error('请输入有效的房间号。');
  }
  try {
    return await request('/start-game', { roomId });
  } catch (error) {
    return {
      message: `未能连接后端，已模拟在房间 ${roomId} 开始游戏。`,
      roomId
    };
  }
}
