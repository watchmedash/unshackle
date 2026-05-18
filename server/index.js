'use strict';

require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const path = require('path');

const { init: initGameLoop } = require('./gameLoop');
const { connect, disconnect } = require('./tiktok');
const { gameState } = require('./state');

const PORT = process.env.PORT || 7740;
const app = express();

app.use(express.json());
app.use('/client', express.static(path.join(__dirname, '..', 'client')));
app.use('/admin',  express.static(path.join(__dirname, '..', 'admin')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.post('/api/connect', (req, res) => {
  const { username } = req.body || {};
  if (!username || !String(username).trim()) {
    return res.status(400).json({ error: 'Username required' });
  }
  connect(String(username).trim(), io);
  res.json({ ok: true });
});

app.post('/api/disconnect', (_req, res) => {
  disconnect(io);
  res.json({ ok: true });
});

app.get('/api/avatar', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).end();
  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).end(); }
  const mod = parsed.protocol === 'https:' ? https : http;
  const request = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (upstream) => {
    if (upstream.statusCode !== 200) { res.status(upstream.statusCode || 502).end(); return; }
    res.set('Content-Type', upstream.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    upstream.pipe(res);
  });
  request.on('error', () => res.status(502).end());
});

app.get('/api/status', (_req, res) => {
  res.json({
    tiktokStatus: gameState.tiktokStatus,
    tiktokUsername: gameState.tiktokUsername,
    ballCount: gameState.balls.size,
  });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.emit('tiktokStatus', {
    status: gameState.tiktokStatus,
    username: gameState.tiktokUsername,
  });
});

server.listen(PORT, () => {
  console.log(`TikTok Arena  →  http://localhost:${PORT}`);
  console.log(`Admin page    →  http://localhost:${PORT}/admin`);
  initGameLoop(io);
});
