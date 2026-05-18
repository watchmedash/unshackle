'use strict';
const { classifyGift, getPointsForEvent, getAbilityDuration } = require('../server/eventHandler');

test('classifyGift 0 coins → null', () => {
  expect(classifyGift(0)).toBeNull();
});

test('classifyGift 1 coin → speedBoost', () => {
  expect(classifyGift(1)).toBe('speedBoost');
});

test('classifyGift 99 coins → speedBoost', () => {
  expect(classifyGift(99)).toBe('speedBoost');
});

test('classifyGift 100 coins → spinBlade', () => {
  expect(classifyGift(100)).toBe('spinBlade');
});

test('classifyGift 499 coins → spinBlade', () => {
  expect(classifyGift(499)).toBe('spinBlade');
});

test('classifyGift 500 coins → heavyBall', () => {
  expect(classifyGift(500)).toBe('heavyBall');
});

test('classifyGift 1500 coins → shockwave', () => {
  expect(classifyGift(1500)).toBe('shockwave');
});

test('classifyGift 5000 coins → airstrike', () => {
  expect(classifyGift(5000)).toBe('airstrike');
});

test('classifyGift 15000 coins → nuke', () => {
  expect(classifyGift(15000)).toBe('nuke');
});

test('getPointsForEvent comment → 1', () => {
  expect(getPointsForEvent('comment')).toBe(1);
});

test('getPointsForEvent like → 2', () => {
  expect(getPointsForEvent('like')).toBe(2);
});

test('getPointsForEvent follow → 10', () => {
  expect(getPointsForEvent('follow')).toBe(10);
});

test('getPointsForEvent share → 15', () => {
  expect(getPointsForEvent('share')).toBe(15);
});

test('getPointsForEvent unknown → 0', () => {
  expect(getPointsForEvent('mystery')).toBe(0);
});

test('getAbilityDuration speedBoost → 5000ms', () => {
  expect(getAbilityDuration('speedBoost')).toBe(5000);
});

test('getAbilityDuration spinBlade → 8000ms', () => {
  expect(getAbilityDuration('spinBlade')).toBe(8000);
});

test('getAbilityDuration heavyBall → 10000ms', () => {
  expect(getAbilityDuration('heavyBall')).toBe(10000);
});

test('getAbilityDuration shockwave → 0 (instant)', () => {
  expect(getAbilityDuration('shockwave')).toBe(0);
});

test('getAbilityDuration airstrike → 0 (instant)', () => {
  expect(getAbilityDuration('airstrike')).toBe(0);
});

test('getAbilityDuration nuke → 0 (instant)', () => {
  expect(getAbilityDuration('nuke')).toBe(0);
});
