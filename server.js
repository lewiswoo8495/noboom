import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const rooms = new Map();
const waitingUsers = [];

const nicknames = [
  '闪电侠',
  '小火箭',
  '天空之眼',
  '夜行者',
  '海浪骑士',
  '星辰猎手',
  '云端漫步',
  '霜焰使者',
  '赤焰追风',
  '幻影游侠',
  '影刃',
  '雷霆之心',
  '月光守望',
  '风暴行者',
  '深海之瞳'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUserProfile() {
  const name = `${nicknames[randomInt(0, nicknames.length - 1)]}${randomInt(1, 99)}`;
  return {
    id: `U${randomInt(10000, 99999)}`,
    name,
    level: `LV${randomInt(1, 20)}`
  };
}

function generateRoomId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function pickRandomUsers(source, count) {
  const selected = [];
  const used = new Set();

  while (selected.length < count && used.size < source.length) {
    const index = randomInt(0, source.length - 1);
    if (!used.has(index)) {
      used.add(index);
      selected.push(source[index]);
    }
  }

  return selected;
}

app.post('/auto-match', (req, res) => {
  const currentUser = generateUserProfile();
  waitingUsers.push(currentUser);

  while (waitingUsers.length < 5) {
    waitingUsers.push(generateUserProfile());
  }

  const matchedPlayers = pickRandomUsers(waitingUsers, 5);
  const matchedIds = new Set(matchedPlayers.map((player) => player.id));

  for (let i = waitingUsers.length - 1; i >= 0; i -= 1) {
    if (matchedIds.has(waitingUsers[i].id)) {
      waitingUsers.splice(i, 1);
    }
  }

  const roomId = generateRoomId();
  rooms.set(roomId, {
    roomId,
    players: matchedPlayers.length,
    status: 'waiting',
    matchedPlayers
  });

  res.json({
    message: `自动匹配成功，已为你找到 ${matchedPlayers.length} 名玩家，正在进入游戏房间。`,
    roomId,
    matchedPlayers,
    players: matchedPlayers.length
  });
});

app.post('/create-room', (req, res) => {
  const roomId = generateRoomId();
  rooms.set(roomId, { roomId, players: 1, status: 'waiting', matchedPlayers: [] });
  res.json({
    message: `房间创建成功，房间号 ${roomId}，请将房间号分享给其他玩家。`,
    roomId,
    status: 'waiting'
  });
});

app.post('/join-room', (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ message: '房间号不能为空。' });
  }

  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ message: '未找到该房间，请检查房间号是否正确。' });
  }

  room.players += 1;
  res.json({
    message: `已加入房间 ${roomId}，当前玩家数：${room.players}。`,
    roomId,
    players: room.players,
    status: room.status
  });
});

app.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (!roomId) {
    return res.status(400).json({ message: '房间号不能为空。' });
  }

  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ message: '未找到该房间，请检查房间号是否正确。' });
  }

  res.json({
    message: `已恢复房间 ${roomId} 信息。`,
    roomId: room.roomId,
    matchedPlayers: room.matchedPlayers || [],
    players: room.players,
    status: room.status
  });
});

app.post('/start-game', (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ message: '房间号不能为空。' });
  }

  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ message: '未找到该房间，无法开始游戏。' });
  }

  room.status = 'started';
  res.json({
    message: `游戏已在房间 ${roomId} 中启动，祝你游戏愉快！`,
    roomId
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.json({
    message: '后端服务器运行正常。这是"不要抽到炸弹"游戏的API服务器。',
    status: 'running',
    endpoints: {
      'POST /auto-match': '自动匹配玩家',
      'POST /create-room': '创建游戏房间',
      'POST /join-room': '加入游戏房间',
      'GET /room/:roomId': '获取房间信息',
      'POST /start-game': '开始游戏'
    }
  });
});
