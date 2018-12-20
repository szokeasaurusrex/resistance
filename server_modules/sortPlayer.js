'use strict'

const UserException = require('./UserException.js')

async function sortPlayer (gameDb, playerName, direction) {
  const playersCollection = gameDb.collection('players')
  const [ players, status ] = await Promise.all([
    playersCollection.find().toArray(),
    gameDb.collection('status').findOne({})
  ])
  const player = players.find(player => player.name === playerName)
  if (status.playing) {
    throw new UserException('Cannot sort players while game is playing')
  } else if (player == null) {
    throw new UserException('The player you are trying to sort does not exist.')
  }
  let inc
  if (direction === 'up' && player.order !== 0) {
    inc = -1
  } else if (player.order !== players.length - 1) {
    inc = 1
  } else {
    return
  }
  const swapPlayer = players.find(
    swapPlayer => swapPlayer.order === player.order + inc
  )
  await Promise.all([
    playersCollection.updateOne(
      { name: player.name },
      { $inc: { order: inc } }
    ),
    playersCollection.updateOne(
      { name: swapPlayer.name },
      { $inc: { order: -inc } }
    )
  ])
}

module.exports = sortPlayer
