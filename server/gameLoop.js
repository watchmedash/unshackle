'use strict';

const Matter = require('matter-js');
const { Engine, Bodies, Body, World, Events } = Matter;

const {
  gameState, calcRadius, calcMaxHp, randomEdgePosition,
  ARENA_W, ARENA_H, ARENA_TOP, RESPAWN_DELAY_MS, BASE_RADIUS,
} = require('./state');

const TICK_MS       = 1000 / 60;
const BROADCAST_MS  = 50;
const WALL_T        = 50;
const COLLISION_DAMAGE = 3;
const MAX_SPEED     = 15;
const WANDER_FORCE  = 0.002;
const CENTER_PULL   = 0.005;

let engine;
let io;
let tickInterval;
let broadcastInterval;

function init(socketio) {
  io = socketio;
  engine = Engine.create({ gravity: { x: 0, y: 0 } });

  const playH   = ARENA_H - ARENA_TOP;
  const centerY = ARENA_TOP + playH / 2;
  World.add(engine.world, [
    Bodies.rectangle(ARENA_W / 2, ARENA_TOP - WALL_T / 2, ARENA_W + WALL_T * 2, WALL_T, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(ARENA_W / 2, ARENA_H + WALL_T / 2,   ARENA_W + WALL_T * 2, WALL_T, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(-WALL_T / 2,        centerY, WALL_T, playH + WALL_T * 2, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(ARENA_W + WALL_T / 2, centerY, WALL_T, playH + WALL_T * 2, { isStatic: true, label: 'wall' }),
  ]);

  Events.on(engine, 'collisionStart', onCollision);

  tickInterval     = setInterval(tick, TICK_MS);
  broadcastInterval = setInterval(broadcast, BROADCAST_MS);
}

function stop() {
  clearInterval(tickInterval);
  clearInterval(broadcastInterval);
  if (engine) Engine.clear(engine);
}

function tick() {
  if (gameState.tiktokStatus !== 'connected') return;
  syncBodies();
  applyWanderForces();
  capSpeeds();
  Engine.update(engine, TICK_MS);
  processRespawns();
  processRegen();
}

// ── Body lifecycle ──────────────────────────────────────────────────────────

function syncBodies() {
  for (const [username, ball] of gameState.balls) {
    if (ball._remove) {
      if (ball.body) World.remove(engine.world, ball.body);
      gameState.balls.delete(username);
      continue;
    }
    if (!ball.body && !ball.isDead) {
      spawnBody(ball);
    }
    if (ball.body) {
      const newR = calcRadius(ball.score);
      if (newR !== ball.radius) {
        const pos = ball.body.position;
        const vel = ball.body.velocity;
        World.remove(engine.world, ball.body);
        ball.radius = newR;
        const body = Bodies.circle(pos.x, pos.y, newR, {
          restitution: 0.8, friction: 0.0, frictionAir: 0.002,
          density: 0.002, label: ball.username,
        });
        Body.setVelocity(body, vel);
        World.add(engine.world, body);
        ball.body = body;
        const newMaxHp = calcMaxHp(ball.score);
        const oldMaxHp = calcMaxHp(ball.score - 1);
        ball.hp = Math.min(newMaxHp, ball.hp + (newMaxHp - oldMaxHp));
      }
    }
  }
}

function spawnBody(ball) {
  const pos = randomEdgePosition(ball.radius);
  const body = Bodies.circle(pos.x, pos.y, ball.radius, {
    restitution: 0.8, friction: 0.0, frictionAir: 0.002,
    density: 0.002, label: ball.username,
  });
  const dx = ARENA_W / 2 - pos.x;
  const dy = ARENA_H / 2 - pos.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  Body.setVelocity(body, { x: (dx / len) * 8, y: (dy / len) * 8 });
  World.add(engine.world, body);
  ball.body = body;
}

// ── Collisions ──────────────────────────────────────────────────────────────

function onCollision({ pairs }) {
  for (const { bodyA, bodyB } of pairs) {
    if (bodyA.label === 'wall' || bodyB.label === 'wall') continue;
    const ballA = gameState.balls.get(bodyA.label);
    const ballB = gameState.balls.get(bodyB.label);
    if (!ballA || !ballB) continue;
    applyDamage(ballA, COLLISION_DAMAGE, ballB.username);
    applyDamage(ballB, COLLISION_DAMAGE, ballA.username);
  }
}

// ── Damage & death ──────────────────────────────────────────────────────────

function applyDamage(ball, amount, attackerUsername) {
  if (ball.isDead) return;
  ball.hp = Math.max(0, ball.hp - amount);
  if (attackerUsername) ball.lastDamagedBy = attackerUsername;
  if (ball.hp === 0) killBall(ball);
}

function killBall(ball) {
  ball.isDead    = true;
  ball.respawnAt = Date.now() + RESPAWN_DELAY_MS;

  if (ball.lastDamagedBy) {
    const attacker = gameState.balls.get(ball.lastDamagedBy);
    if (attacker) { attacker.score += 50; attacker.kills += 1; }
  }

  if (ball.body) { World.remove(engine.world, ball.body); ball.body = null; }
  ball.score  = 0;
  ball.radius = BASE_RADIUS;
}

function processRespawns() {
  for (const ball of gameState.balls.values()) {
    if (ball.isDead && Date.now() >= ball.respawnAt) {
      ball.isDead        = false;
      ball.hp            = calcMaxHp(ball.score);
      ball.respawnAt     = null;
      ball.lastDamagedBy = null;
    }
  }
}

// ── Passive regen ───────────────────────────────────────────────────────────

// 1% of maxHp per second — bigger balls regen faster in absolute terms
function processRegen() {
  for (const ball of gameState.balls.values()) {
    if (ball.isDead || !ball.body) continue;
    const maxHp = calcMaxHp(ball.score);
    if (ball.hp < maxHp) {
      ball.hp = Math.min(maxHp, ball.hp + (maxHp * 0.01) / 60);
    }
  }
}

// ── Wander forces ───────────────────────────────────────────────────────────

function applyWanderForces() {
  for (const ball of gameState.balls.values()) {
    if (!ball.body) continue;
    const { x, y } = ball.body.position;
    const angle = Math.random() * Math.PI * 2;
    let fx = Math.cos(angle) * WANDER_FORCE;
    let fy = Math.sin(angle) * WANDER_FORCE;
    const margin = 180;
    if (x < margin)            fx += CENTER_PULL;
    if (x > ARENA_W - margin)  fx -= CENTER_PULL;
    if (y < ARENA_TOP + margin) fy += CENTER_PULL;
    if (y > ARENA_H - margin)  fy -= CENTER_PULL;
    Body.applyForce(ball.body, ball.body.position, { x: fx, y: fy });
  }
}

// ── Speed cap ───────────────────────────────────────────────────────────────

function capSpeeds() {
  for (const ball of gameState.balls.values()) {
    if (!ball.body) continue;
    const { x: vx, y: vy } = ball.body.velocity;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > MAX_SPEED) {
      Body.setVelocity(ball.body, { x: (vx / speed) * MAX_SPEED, y: (vy / speed) * MAX_SPEED });
    }
  }
}

// ── Broadcast ───────────────────────────────────────────────────────────────

function broadcast() {
  if (!io) return;
  const balls = [];
  for (const ball of gameState.balls.values()) {
    if (ball.isDead || !ball.body) continue;
    balls.push({
      u:   ball.username,
      dn:  ball.displayName || ball.username,
      c:   ball.color,
      r:   ball.radius,
      hp:  ball.hp,
      mhp: calcMaxHp(ball.score),
      s:   ball.score,
      x:   Math.round(ball.body.position.x),
      y:   Math.round(ball.body.position.y),
      av:  ball.avatarUrl || null,
    });
  }

  io.emit('state', {
    balls,
    fx: gameState.pendingEffects.splice(0),
  });
}

module.exports = { init, stop };
