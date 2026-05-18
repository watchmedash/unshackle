'use strict';

const { gameState, createBallData, calcMaxHp, MAX_PLAYERS } = require('./state');

const POINTS = {
  comment: 1,
  like:    2,
  follow:  10,
  share:   15,
};

const HEAL = {
  comment: 2,
  like:    5,
  follow:  15,
  share:   15,
};

function getPointsForEvent(eventType) {
  return POINTS[eventType] || 0;
}

function ensurePlayer(username, avatarUrl, displayName) {
  if (!gameState.balls.has(username)) {
    if (gameState.balls.size >= MAX_PLAYERS) return null;
    gameState.balls.set(username, createBallData(username));
  }
  const ball = gameState.balls.get(username);
  if (avatarUrl && !ball.avatarUrl) ball.avatarUrl = avatarUrl;
  if (displayName) ball.displayName = displayName;
  return ball;
}

function handleEngagement(username, eventType, avatarUrl, displayName) {
  const ball = ensurePlayer(username, avatarUrl, displayName);
  if (!ball) return;
  ball.score += getPointsForEvent(eventType);
  const heal = HEAL[eventType] || 0;
  if (heal > 0) ball.hp = Math.min(calcMaxHp(ball.score), ball.hp + heal);
}

// Gifts heal HP proportional to coin value, capped at max HP
function handleGift(username, diamondCount, avatarUrl, displayName) {
  if (!diamondCount || diamondCount < 1) return;
  const ball = ensurePlayer(username, avatarUrl, displayName);
  if (!ball) return;
  const heal = Math.min(Math.floor(diamondCount / 5), 200);
  ball.hp = Math.min(calcMaxHp(ball.score), ball.hp + heal);
}

module.exports = {
  getPointsForEvent,
  handleEngagement,
  handleGift,
  ensurePlayer,
};
