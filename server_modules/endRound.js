'use strict'

const UserException = require('./UserException.js')

async function endRound (gameDb) {
  const [gameStatus, teams] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('teams').findOne({})
  ])
  if (!gameStatus.playing) {
    throw new UserException('Cannot end round. No round is in progress.')
  }
  await Promise.all([
    gameDb.collection('status').updateOne({}, { $set: { playing: false } }),
    gameDb.collection('teams').drop()
  ])
  return teams
}

module.exports = endRound
