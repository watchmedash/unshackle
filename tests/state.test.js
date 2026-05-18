'use strict';
const { hashColor, calcRadius, createBallData, BASE_RADIUS, MAX_RADIUS } = require('../server/state');

test('hashColor returns a valid 24-bit color number', () => {
  const c = hashColor('testuser');
  expect(typeof c).toBe('number');
  expect(c).toBeGreaterThanOrEqual(0);
  expect(c).toBeLessThanOrEqual(0xFFFFFF);
});

test('hashColor is deterministic', () => {
  expect(hashColor('alice')).toBe(hashColor('alice'));
});

test('hashColor differs for different usernames', () => {
  expect(hashColor('alice')).not.toBe(hashColor('bob'));
});

test('calcRadius returns BASE_RADIUS at score 0', () => {
  expect(calcRadius(0)).toBe(BASE_RADIUS);
});

test('calcRadius grows with score', () => {
  expect(calcRadius(100)).toBeGreaterThan(BASE_RADIUS);
});

test('calcRadius caps at MAX_RADIUS', () => {
  expect(calcRadius(999999)).toBe(MAX_RADIUS);
});

test('createBallData returns correct initial state', () => {
  const ball = createBallData('alice');
  expect(ball.username).toBe('alice');
  expect(ball.hp).toBe(100);
  expect(ball.score).toBe(0);
  expect(ball.kills).toBe(0);
  expect(ball.isDead).toBe(false);
  expect(ball.abilityQueue).toEqual([]);
  expect(ball.activeAbility).toBeNull();
  expect(ball.body).toBeNull();
  expect(ball.respawnAt).toBeNull();
  expect(ball.lastDamagedBy).toBeNull();
});

test('createBallData assigns a color based on username', () => {
  const ball = createBallData('alice');
  expect(ball.color).toBe(hashColor('alice'));
});
