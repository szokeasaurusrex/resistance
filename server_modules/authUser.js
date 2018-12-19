'use strict'

const crypto = require('crypto')
const UserException = require('./UserException.js')
const getGamesCollection = require('./db.js').getGamesCollection

async function authUser (gameDb, socketClientId, authKey) {
  const gamesCollection = getGamesCollection()

  let query = { code: parseInt(authKey.gameCode) }
  if (!(await gamesCollection.findOne(query))) {
    throw new UserException(
      'The game you are trying to enter does not exist',
      'authError'
    )
  }
  query = {
    name: authKey.name
  }
  const player = await gameDb.collection('players').findOne(query)
  if (!player) {
    throw new UserException(
      'You have not yet joined the game properly',
      'authError'
    )
  }
  await gameDb.collection('players').updateOne(query, {
    $set: {
      hasConnected: true
    }
  })
  const hash = crypto.createHash('sha256')
  hash.update(authKey.key)
  if (hash.digest('hex') === player.hashedKey) {
    return {
      authenticated: true,
      name: authKey.name,
      hasConnected: player.hasConnected
    }
  } else {
    throw new UserException('Unauthorized', 'authError')
  }
}

module.exports = authUser
