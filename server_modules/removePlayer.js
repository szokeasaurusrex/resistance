'use strict'

const UserException = require('./UserException.js')
const getGamesCollection = require('./db.js').getGamesCollection

async function removePlayer (gameDb, playerName) {
  const gamesCollection = getGamesCollection()
  const [status, players] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').find().toArray()
  ])
  const playerToRemove = players.find(
    player => player.name === playerName
  )
  if (status.playing) {
    throw new UserException('Cannot remove player while game in progress')
  } else if (playerToRemove == null) {
    throw new UserException('The player you try to remove is not in game')
  }
  const deleteCommands = []
  deleteCommands.push(
    gameDb.collection('players').deleteOne({
      name: playerToRemove.name
    }),
    gameDb.collection('players').updateMany({
      order: { $gt: playerToRemove.order }
    }, {
      $inc: { order: -1 }
    })
  )
  if (players.length === 1) {
    deleteCommands.push(
      gameDb.dropDatabase(),
      gamesCollection.deleteOne({
        code: playerToRemove.gameCode
      })
    )
  }
  await Promise.all(deleteCommands)
  return {
    playerRemoved: playerToRemove
  }
}

module.exports = removePlayer
