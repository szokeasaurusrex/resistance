'use strict'

const constants = require('../constants.js')

async function createGame (db, gamesCollection) {
  // Creates game and returns the code
  const gameCodeLength = constants.GAME_CODE_LENGTH
  if (await gamesCollection.countDocuments() > 100000) {
    throw new Error('There are too many games in progress to start a new one.')
  }
  let gameCode
  do {
    gameCode = Math.floor(Math.random() * (10 ** gameCodeLength))
  } while (await gamesCollection.findOne({ code: gameCode }))
  await Promise.all([
    db.db('game-' + gameCode).collection('status').insertOne({
      playing: false,
      lastGameStart: new Date()
    }),
    gamesCollection.insertOne({
      code: gameCode
    })
  ])
  return gameCode
}

module.exports = createGame
