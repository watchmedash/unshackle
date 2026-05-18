'use strict';

const ARENA_W   = 1080;
const ARENA_H   = 1920;
const ARENA_TOP = 96;   // below the HUD panel
const BASE_RADIUS = 20;
const MAX_RADIUS = 75;
const BASE_HP = 100;
const RESPAWN_DELAY_MS = 5000;
const MAX_PLAYERS = 150;

function hashColor(username) {
  let hash = 5381;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) + hash) + username.charCodeAt(i);
    hash = hash & 0xFFFFFF;
  }
  return Math.abs(hash) & 0xFFFFFF;
}

function calcRadius(score) {
  return Math.min(MAX_RADIUS, BASE_RADIUS + Math.floor(score / 10));
}

// Bigger balls = more max HP: 100 at score 0, up to 400 at score ~900
function calcMaxHp(score) {
  return Math.min(400, 100 + Math.floor(score / 3));
}

function randomEdgePosition(radius) {
  const minY = ARENA_TOP + radius;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: return { x: Math.random() * (ARENA_W - radius * 2) + radius, y: minY };
    case 1: return { x: Math.random() * (ARENA_W - radius * 2) + radius, y: ARENA_H - radius };
    case 2: return { x: radius, y: Math.random() * (ARENA_H - minY - radius) + minY };
    case 3: return { x: ARENA_W - radius, y: Math.random() * (ARENA_H - minY - radius) + minY };
    default: return { x: ARENA_W / 2, y: minY };
  }
}

function createBallData(username) {
  return {
    username,
    displayName: username,
    color: hashColor(username),
    radius: BASE_RADIUS,
    hp: BASE_HP,
    score: 0,
    kills: 0,
    isDead: false,
    respawnAt: null,
    lastDamagedBy: null,
    body: null,
    avatarUrl: null,
    _remove: false,
  };
}

const gameState = {
  balls: new Map(),
  pendingEffects: [],
  tiktokUsername: null,
  tiktokStatus: 'disconnected',
};

module.exports = {
  gameState,
  createBallData,
  hashColor,
  calcRadius,
  calcMaxHp,
  randomEdgePosition,
  ARENA_W,
  ARENA_H,
  ARENA_TOP,
  BASE_HP,
  BASE_RADIUS,
  MAX_RADIUS,
  MAX_PLAYERS,
  RESPAWN_DELAY_MS,
};
