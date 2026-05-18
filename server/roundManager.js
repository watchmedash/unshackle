'use strict';

const { gameState } = require('./state');

function resetArena() {
  for (const ball of gameState.balls.values()) {
    ball._remove = true;
  }
  gameState.pendingEffects = [];
}

module.exports = { resetArena };
