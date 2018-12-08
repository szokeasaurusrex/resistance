'use strict'

async function getGameStatus (gameDb, player) {
  player = player || ''
  try {
    const gameInfo = await Promise.all([
      gameDb.collection('status').findOne({}),
      gameDb.collection('players').find({}).toArray()
    ])
    if (!gameInfo[0].playing) {
      const players = gameInfo[1].map(player => ({
        name: player.name,
        order: player.order,
        gameCode: player.gameCode
      }))
      return {
        playing: false,
        players: players
      }
    }
  } catch (e) {
    console.error(e)
    return {
      error: new Error('An unexpected error occurred')
    }
  }
}

module.exports = getGameStatus
