// Đồng Thanh – máy chủ phòng chơi realtime.
// Phục vụ trang game (public/index.html) và một WebSocket /ws
// giữ "presence" (trạng thái) của từng người trong từng phòng.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const PAGE = path.join(__dirname, 'public', 'index.html');
const ROOM_RE = /^[a-z0-9_][a-z0-9_.-]{0,47}$/;
const ID_RE = /^[a-z0-9]{6,24}$/;
const MAX_PRESENCE = 4096;
const MAX_ROOMS_PER_CLIENT = 16;

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/healthz') { res.writeHead(200); res.end('ok'); return; }
  if (url === '/' || url === '/index.html') {
    fs.readFile(PAGE, (err, buf) => {
      if (err) { res.writeHead(500); res.end('Không đọc được trang game'); return; }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
      res.end(buf);
    });
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Không tìm thấy');
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });
const rooms = new Map();   // tên phòng -> Map(id -> { ws, presence })
const clients = new Map(); // id -> ws
const dirty = new Set();

function flush() {
  for (const name of dirty) {
    const room = rooms.get(name);
    if (!room) continue;
    const peers = [...room].map(([peer, v]) => ({ peer, presence: v.presence }));
    const msg = JSON.stringify({ t: 'peers', room: name, peers });
    for (const v of room.values()) if (v.ws.readyState === 1) v.ws.send(msg);
  }
  dirty.clear();
}
setInterval(flush, 40);

function leave(ws, name) {
  const room = rooms.get(name);
  if (room && room.delete(ws.id)) { dirty.add(name); if (!room.size) rooms.delete(name); }
  ws.rooms.delete(name);
}

wss.on('connection', (ws, req) => {
  const asked = new URL(req.url, 'http://x').searchParams.get('id');
  const taken = asked && clients.has(asked) && clients.get(asked).readyState === 1;
  ws.id = asked && ID_RE.test(asked) && !taken ? asked : 'p' + crypto.randomBytes(6).toString('hex');
  ws.rooms = new Set();
  ws.alive = true;
  clients.set(ws.id, ws);
  ws.send(JSON.stringify({ t: 'hello', id: ws.id, now: Date.now() }));

  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m.room !== 'string' || !ROOM_RE.test(m.room)) return;
    if (m.t === 'join') {
      if (!ws.rooms.has(m.room) && ws.rooms.size >= MAX_ROOMS_PER_CLIENT) return;
      const p = m.presence && typeof m.presence === 'object' ? m.presence : {};
      if (JSON.stringify(p).length > MAX_PRESENCE) return;
      if (!rooms.has(m.room)) rooms.set(m.room, new Map());
      rooms.get(m.room).set(ws.id, { ws, presence: p });
      ws.rooms.add(m.room); dirty.add(m.room);
    } else if (m.t === 'presence') {
      const entry = rooms.get(m.room) && rooms.get(m.room).get(ws.id);
      if (!entry || !m.patch || typeof m.patch !== 'object') return;
      const next = { ...entry.presence };
      for (const k of Object.keys(m.patch)) { if (m.patch[k] === null) delete next[k]; else next[k] = m.patch[k]; }
      if (JSON.stringify(next).length > MAX_PRESENCE) return;
      entry.presence = next; dirty.add(m.room);
    } else if (m.t === 'leave') {
      leave(ws, m.room);
    }
  });
  ws.on('close', () => {
    for (const name of [...ws.rooms]) leave(ws, name);
    if (clients.get(ws.id) === ws) clients.delete(ws.id);
  });
});

// Nhịp đồng hồ chung cho các phòng chơi: mang giờ máy chủ để mọi người đếm ngược giống nhau,
// và đánh thức tab chủ phòng kể cả khi tab đó đang ẩn (trình duyệt làm chậm bộ hẹn giờ của tab ẩn).
setInterval(() => {
  const msg = JSON.stringify({ t: 'tick', now: Date.now() });
  for (const [name, room] of rooms) {
    if (name === '__lobby') continue;
    for (const v of room.values()) if (v.ws.readyState === 1) v.ws.send(msg);
  }
}, 500);

// Ngắt các kết nối "chết" để người rời mạng biến khỏi phòng.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false; ws.ping();
  }
}, 20000);

server.listen(PORT, () => console.log(`Đồng Thanh đang chạy tại http://localhost:${PORT}`));
