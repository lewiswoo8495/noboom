const autoMatchBtn = document.getElementById("autoMatchBtn");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const joinPanel = document.getElementById("joinPanel");
const cancelJoinBtn = document.getElementById("cancelJoinBtn");
const startGameBtn = document.getElementById("startGameBtn");
const roomIdInput = document.getElementById("roomIdInput");
const messagePanel = document.getElementById("messagePanel");

function showMessage(text) {
  messagePanel.textContent = text;
  messagePanel.classList.remove("hidden");
}

function hideMessage() {
  messagePanel.classList.add("hidden");
}

function openJoinPanel() {
  joinPanel.classList.remove("hidden");
  roomIdInput.focus();
  hideMessage();
}

function closeJoinPanel() {
  joinPanel.classList.add("hidden");
  roomIdInput.value = "";
}

function validateRoomId(roomId) {
  return roomId.trim().length > 0;
}

autoMatchBtn.addEventListener("click", () => {
  showMessage("正在自动匹配，请稍候……");
});

createRoomBtn.addEventListener("click", () => {
  showMessage("已为你创建一个新房间，等待其他玩家加入。");
});

joinRoomBtn.addEventListener("click", openJoinPanel);
cancelJoinBtn.addEventListener("click", closeJoinPanel);

startGameBtn.addEventListener("click", () => {
  const roomId = roomIdInput.value;
  if (!validateRoomId(roomId)) {
    showMessage("请输入有效的房间号。示例：123456");
    return;
  }
  showMessage(`准备进入房间 ${roomId} 并开始游戏。`);
});
