'use strict';

const { WebcastPushConnection } = require('tiktok-live-connector');
const { handleEngagement, handleGift } = require('./eventHandler');
const { gameState } = require('./state');
const { resetArena } = require('./roundManager');

let connection = null;

function connect(username, io) {
  if (connection) {
    connection.disconnect();
    connection = null;
  }

  const clean = username.replace(/^@/, '').trim();
  gameState.tiktokUsername = clean;
  gameState.tiktokStatus = 'connecting';
  io.emit('tiktokStatus', { status: 'connecting', username: clean });

  connection = new WebcastPushConnection(clean);

  connection.connect()
    .then(() => {
      gameState.tiktokStatus = 'connected';
      io.emit('tiktokStatus', { status: 'connected', username: clean });
    })
    .catch((err) => {
      gameState.tiktokStatus = 'error';
      io.emit('tiktokStatus', { status: 'error', message: err.message });
    });

  connection.on('chat',   ({ uniqueId, nickname, profilePictureUrl }) => handleEngagement(uniqueId, 'comment', profilePictureUrl, nickname));
  connection.on('like',   ({ uniqueId, nickname, profilePictureUrl }) => handleEngagement(uniqueId, 'like',    profilePictureUrl, nickname));
  connection.on('follow', ({ uniqueId, nickname, profilePictureUrl }) => handleEngagement(uniqueId, 'follow',  profilePictureUrl, nickname));
  connection.on('share',  ({ uniqueId, nickname, profilePictureUrl }) => handleEngagement(uniqueId, 'share',   profilePictureUrl, nickname));
  connection.on('gift',   ({ uniqueId, nickname, profilePictureUrl, diamondCount }) => handleGift(uniqueId, diamondCount || 0, profilePictureUrl, nickname));

  connection.on('disconnected', () => {
    gameState.tiktokStatus = 'disconnected';
    io.emit('tiktokStatus', { status: 'disconnected' });
    resetArena();
  });

  connection.on('error', (err) => {
    gameState.tiktokStatus = 'error';
    io.emit('tiktokStatus', { status: 'error', message: err.message });
  });
}

function disconnect(io) {
  if (connection) {
    connection.disconnect();
    connection = null;
  }
  gameState.tiktokUsername = null;
  gameState.tiktokStatus = 'disconnected';
  io.emit('tiktokStatus', { status: 'disconnected' });
  resetArena();
}

module.exports = { connect, disconnect };
