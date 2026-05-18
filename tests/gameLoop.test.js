'use strict';
const { calcCollisionDamage } = require('../server/gameLoop');

test('calcCollisionDamage equal mass → 0 damage', () => {
  expect(calcCollisionDamage(1, 1)).toBe(0);
});

test('calcCollisionDamage larger difference → more damage', () => {
  const small = calcCollisionDamage(1, 2);
  const large = calcCollisionDamage(1, 5);
  expect(large).toBeGreaterThan(small);
});

test('calcCollisionDamage is symmetric', () => {
  expect(calcCollisionDamage(3, 1)).toBe(calcCollisionDamage(1, 3));
});

test('calcCollisionDamage is always non-negative', () => {
  expect(calcCollisionDamage(5, 1)).toBeGreaterThanOrEqual(0);
  expect(calcCollisionDamage(1, 5)).toBeGreaterThanOrEqual(0);
});
