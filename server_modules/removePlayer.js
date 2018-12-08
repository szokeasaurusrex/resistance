'use strict'

const UserException = require('./UserException.js')

async function removePlayer (gameDb, gamesCollection, playerToRemove) {
  const mongoCommands = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').findOne({
      name: playerToRemove.name
    })
  ])
  const status = mongoCommands[0]
  const playerToRemoveMongo = mongoCommands[1]
  if (status.playing) {
    throw new UserException('Cannot remove player while game in progress')
  } else if (!playerToRemoveMongo) {
    throw new UserException('The player you try to remove is not in game')
  }
  await gameDb.collection('players').deleteOne({ name: playerToRemove.name })
  const players = await gameDb.collection('players').find({}).toArray()
  if (players.length === 0) {
    await Promise.all([
      gameDb.dropDatabase(),
      gamesCollection.deleteOne({
        code: playerToRemove.gameCode
      })
    ])
  }
  return {
    playerToRemove: playerToRemove,
    socketClientId: playerToRemoveMongo.socketClientId
  }
}

module.exports = removePlayer
