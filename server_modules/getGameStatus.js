'use strict'

function cleanPlayers (players) {
  // return only player properties safe to share with client
  return players.map(player => ({
    name: player.name,
    gameCode: player.gameCode
  }))
}

async function getGameStatus (gameDb, player) {
  try {
    const [gameStatus, players, teams] = await Promise.all([
      gameDb.collection('status').findOne({}),
      gameDb.collection('players').find().sort({ order: 1 }).toArray(),
      gameDb.collection('teams').findOne({})
    ])
    const cleanedPlayers = cleanPlayers(players)
    if (gameStatus.playing) {
      // TODO: add actions for mission proposal, voting, etc.
      const { lastGameStart, ...cleanedStatus } = gameStatus
      if (player != null && teams.resistance.includes(player)) {
        return {
          players: cleanedPlayers,
          ...cleanedStatus
        }
      } else {
        return {
          spies: teams.spies,
          players: cleanedPlayers,
          ...cleanedStatus
        }
      }
    } else {
      return {
        playing: false,
        players: cleanedPlayers
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
