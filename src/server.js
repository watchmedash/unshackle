const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

const POINT_RULES = { like: 1, follow: 5, share: 3, comment: 2 };

const GIFT_EMOJI = {
  'Rose': '🌹', 'Finger Heart': '🤞', 'Drama Queen': '👑',
  'Lion': '🦁', 'Rocket': '🚀', 'Universe': '🌌', 'TikTok': '🎵',
  'GG': '🎮', 'Ice Cream': '🍦', 'Sunglasses': '😎',
};

let racers = {};
let tiktokConnection = null;
let connectedUsername = null;
let connectionStatus = 'disconnected';
let connectionError = null;
let connectedSince = null; // timestamp when we became connected

const COLORS = [
  '#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF','#FF8B94','#B4A7D6',
  '#F7DC6F','#85C1E9','#F1948A','#82E0AA','#F8C471','#AED6F1',
  '#D7BDE2','#A9DFBF','#FAD7A0','#F9E79F','#ABEBC6','#FF9FF3',
  '#54A0FF','#5F27CD','#00D2D3','#FF9F43','#EE5A24','#FD79A8',
  '#FDCB6E','#6C5CE7','#00CEC9','#C8D6E5','#8395A7','#55EFC4',
];
let colorIndex = 0;

function getNextColor() { return COLORS[(colorIndex++) % COLORS.length]; }

function getInitials(name) {
  const clean = (name || 'XX').replace(/^@/, '').replace(/[_]/g, ' ');
  const words = clean.trim().split(/\s+/);
  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : clean.slice(0, 2).toUpperCase();
}

function getOrCreateRacer(uniqueId, nickname, profilePicUrl) {
  const id = uniqueId.toLowerCase();
  if (!racers[id]) {
    const display = nickname || uniqueId;
    racers[id] = { id, uniqueId, name: `@${display}`, avatar: getInitials(display), color: getNextColor(), profilePic: profilePicUrl || null, points: 0, events: [] };
    console.log(`[+] New racer: @${display}`);
  } else if (profilePicUrl && !racers[id].profilePic) {
    racers[id].profilePic = profilePicUrl;
  }
  return racers[id];
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

function addPoints(uniqueId, nickname, profilePic, pts, eventType, extra = {}) {
  const racer = getOrCreateRacer(uniqueId, nickname, profilePic);
  racer.points += pts;
  racer.events.push({ type: eventType, points: pts, ts: Date.now(), ...extra });
  broadcast({ type: 'point_update', userId: racer.id, points: racer.points, delta: pts, eventType, ...extra, racers: getLeaderboard() });
}

function getLeaderboard() {
  return Object.values(racers).sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }));
}

function broadcastStatus() {
  broadcast({ type: 'connection_status', status: connectionStatus, username: connectedUsername, error: connectionError });
}

function connectToTikTok(username) {
  if (tiktokConnection) { try { tiktokConnection.disconnect(); } catch {} tiktokConnection = null; }

  const clean = username.replace(/^@/, '').trim();

  // Only wipe scores when switching to a different stream
  if (connectedUsername !== clean) {
    racers = {}; colorIndex = 0;
  }

  connectedSince = null;
  connectedUsername = clean;
  connectionStatus = 'connecting';
  connectionError = null;
  broadcastStatus();
  console.log(`\n🔗 Connecting to @${clean}...`);

  const conn = new WebcastPushConnection(clean, {
    processInitialData: true,
    enableExtendedGiftInfo: true,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 2000,
  });
  tiktokConnection = conn;

  conn.connect()
    .then(state => {
      connectionStatus = 'connected';
      connectionError = null;
      connectedSince = Date.now();
      broadcastStatus();
      console.log(`✅ Connected to @${clean} | Room: ${state.roomId}`);
    })
    .catch(err => {
      connectionStatus = 'error';
      connectionError = err.message || 'Failed to connect. Make sure the user is currently LIVE.';
      broadcastStatus();
      console.error(`❌ Connect failed: ${err.message}`);
      tiktokConnection = null;
    });

  const pic = d => d.profilePictureUrl || d.avatarThumb || null;

  conn.on('like',   d => addPoints(d.uniqueId, d.nickname, pic(d), (d.likeCount || 1) * POINT_RULES.like, 'like'));
  conn.on('follow', d => addPoints(d.uniqueId, d.nickname, pic(d), POINT_RULES.follow, 'follow'));
  conn.on('share',  d => addPoints(d.uniqueId, d.nickname, pic(d), POINT_RULES.share, 'share'));
  conn.on('chat',   d => addPoints(d.uniqueId, d.nickname, pic(d), POINT_RULES.comment, 'comment', { comment: (d.comment || '').slice(0, 80) }));
  conn.on('member', d => getOrCreateRacer(d.uniqueId, d.nickname, pic(d)));

  conn.on('gift', d => {
    if (d.giftType === 1 && !d.repeatEnd) return;
    const coins = d.diamondCount || 0;
    if (!coins) return;
    const pts = coins * 10;
    const emoji = GIFT_EMOJI[d.giftName] || '🎁';
    addPoints(d.uniqueId, d.nickname, pic(d), pts, 'gift', { giftName: d.giftName, emoji, coins, repeatCount: d.repeatCount || 1 });
    console.log(`🎁 ${d.nickname}: ${d.repeatCount || 1}x ${d.giftName} (${coins}c = +${pts}pts)`);
  });

  conn.on('disconnected', () => {
    console.log(`⚠️  Disconnected event fired (status=${connectionStatus}, age=${connectedSince ? Date.now()-connectedSince : 'n/a'}ms)`);
    // tiktok-live-connector fires 'disconnected' during internal WS upgrade — ignore if:
    // 1. We're not in connected state yet, OR
    // 2. We only just connected (< 5s ago) — likely the polling→WS upgrade handoff
    if (connectionStatus !== 'connected') {
      console.log('   → ignored (not connected yet)');
      return;
    }
    if (connectedSince && (Date.now() - connectedSince) < 5000) {
      console.log('   → ignored (too soon after connect, likely WS upgrade)');
      return;
    }
    connectionStatus = 'disconnected';
    connectedSince = null;
    broadcastStatus();
    console.log('   → real disconnect, notifying clients');
  });

  conn.on('error', err => {
    // Log but don't change status — errors can be transient
    console.error(`TikTok error (status=${connectionStatus}):`, err.message || err);
  });
}

app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/control.html'));
});

app.post('/connect', (req, res) => {
  const { username } = req.body;
  if (!username?.trim()) return res.status(400).json({ error: 'Username required' });
  connectToTikTok(username.trim());
  res.json({ success: true });
});

app.post('/disconnect', (req, res) => {
  if (tiktokConnection) { try { tiktokConnection.disconnect(); } catch {} tiktokConnection = null; }
  connectionStatus = 'disconnected'; connectedSince = null;
  broadcastStatus();
  broadcast({ type: 'init', racers: getLeaderboard(), rules: POINT_RULES, status: 'disconnected', username: connectedUsername });
  res.json({ success: true });
});

app.get('/state', (req, res) => {
  res.json({ racers: getLeaderboard(), rules: POINT_RULES, status: connectionStatus, username: connectedUsername, error: connectionError });
});

wss.on('connection', ws => {
  console.log('Browser connected');
  ws.send(JSON.stringify({ type: 'init', racers: getLeaderboard(), rules: POINT_RULES, status: connectionStatus, username: connectedUsername, error: connectionError }));
  ws.on('close', () => console.log('Browser disconnected'));
});

const PORT = process.env.PORT || 7735;
server.listen(PORT, () => {
  console.log(`\n🎵 TikTok Race → http://localhost:${PORT}`);
  console.log(`📡 Enter a TikTok @username in the browser to start\n`);
});
