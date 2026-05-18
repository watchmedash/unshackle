'use strict';
const { getNextPhase, getPhaseDuration } = require('../server/roundManager');

test('lobby → round', () => {
  expect(getNextPhase('lobby')).toBe('round');
});

test('round → intermission', () => {
  expect(getNextPhase('round')).toBe('intermission');
});

test('intermission → lobby', () => {
  expect(getNextPhase('intermission')).toBe('lobby');
});

test('unknown phase falls back to lobby', () => {
  expect(getNextPhase('unknown')).toBe('lobby');
});

test('getPhaseDuration lobby defaults to 15000ms', () => {
  delete process.env.LOBBY_DURATION_SECONDS;
  expect(getPhaseDuration('lobby')).toBe(15000);
});

test('getPhaseDuration round defaults to 180000ms', () => {
  delete process.env.ROUND_DURATION_SECONDS;
  expect(getPhaseDuration('round')).toBe(180000);
});

test('getPhaseDuration intermission defaults to 15000ms', () => {
  delete process.env.INTERMISSION_DURATION_SECONDS;
  expect(getPhaseDuration('intermission')).toBe(15000);
});

test('getPhaseDuration respects ROUND_DURATION_SECONDS env override', () => {
  process.env.ROUND_DURATION_SECONDS = '60';
  expect(getPhaseDuration('round')).toBe(60000);
  delete process.env.ROUND_DURATION_SECONDS;
});
