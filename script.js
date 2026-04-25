let peer = null;
let conn = null;
let isInitiator = false;
const roomInput = document.getElementById('room');
const joinBtn = document.getElementById('joinBtn');
const chatArea = document.getElementById('chat-area');
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg');
const sendBtn = document.getElementById('sendBtn');

function appendMessage(text, type) {
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

joinBtn.onclick = () => {
  const roomCode = roomInput.value.trim();
  if (!roomCode) {
    alert('Please enter a room code.');
    return;
  }
  document.getElementById('room-setup').style.display = 'none';
  chatArea.style.display = 'block';

  peer = new Peer(roomCode, {
    host: 'peerjs.com',
    port: 443,
    path: '/',
    secure: true
  });

  peer.on('open', (id) => {
    appendMessage(`Your room code: ${id}`, 'peer');
    isInitiator = true;
  });

  peer.on('connection', (c) => {
    conn = c;
    appendMessage('Peer joined. Start chatting!', 'peer');
    setupConnection();
  });

  peer.on('error', (err) => {
    // If room already taken, join as peer
    if (err.type === 'unavailable-id') {
      peer = new Peer(undefined, {
        host: 'peerjs.com',
        port: 443,
        path: '/',
        secure: true
      });
      peer.on('open', (id) => {
        conn = peer.connect(roomCode);
        conn.on('open', () => {
          appendMessage('Connected to peer. Start chatting!', 'peer');
          setupConnection();
        });
      });
    } else {
      alert('Error: ' + err);
    }
  });
};

function setupConnection() {
  conn.on('data', (data) => {
    appendMessage(data, 'peer');
  });
  conn.on('close', () => {
    appendMessage('Peer disconnected.', 'peer');
  });
}

sendBtn.onclick = () => {
  const msg = msgInput.value.trim();
  if (!msg || !conn || conn.open === false) return;
  conn.send(msg);
  appendMessage(msg, 'self');
  msgInput.value = '';
};