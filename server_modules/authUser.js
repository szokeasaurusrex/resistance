'use strict'

const UserException = require('./UserException.js')

const crypto = require('crypto')

async function authUser (gameDb, gamesCollection, socketClientId, authKey) {
  const query = { code: parseInt(authKey.gameCode) }
  if (!(await gamesCollection.findOne(query))) {
    throw new UserException(
      'The game you are trying to enter does not exist',
      'authError'
    )
  }
  const player = await gameDb.collection('players').findOne({
    name: authKey.name
  })
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
      gameCode: authKey.gameCode
    }
  } else {
    throw new UserException('Unauthorized', 'authError')
  }
}

module.exports = authUser