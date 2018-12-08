'use strict'

const constants = require('../constants.js')
const getDb = require('./db.js').getDb

function periodicallyDeleteGames () {
  const db = getDb()

  const gamesCollection = db.db('games').collection('games')
  setInterval(async () => {
    try {
      const games = await gamesCollection.find({}).toArray()
      const gameStatuses = await Promise.all(
        Array.from(games, game => new Promise(async (resolve, reject) => {
          try {
            const statusCollection = (
              await db.db('game-' + game.code).collection('status').findOne({})
            )
            resolve({
              code: game.code,
              status: statusCollection
            })
          } catch (e) {
            reject(e)
          }
        }))
      )
      let dropCommands = []
      const currentDate = new Date()
      gameStatuses.forEach(game => {
        const shouldDie = (!game.status ||
          currentDate - game.status.lastGameStart > constants.GAME_TTL)
        if (shouldDie) {
          dropCommands.push(db.db('game-' + game.code).dropDatabase())
          dropCommands.push(gamesCollection.deleteOne({ code: game.code }))
          console.log('Deleted game ' + game.code)
        }
      })
      await Promise.all(dropCommands)
    } catch (e) {
      console.error(e)
    }
  }, constants.GAME_TTL)
}

module.exports = periodicallyDeleteGames
