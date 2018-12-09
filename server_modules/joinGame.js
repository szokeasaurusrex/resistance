'use strict'

const crypto = require('crypto')
const UserException = require('./UserException.js')
const createGame = require('./createGame.js')
const constants = require('../constants.js')
const getGamesCollection = require('./db.js').getGamesCollection

function randomBytesHexAsync (size) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
      if (err) {
        reject(err)
      } else {
        resolve(buf.toString('hex'))
      }
    })
  })
}

async function joinGame (db, name, gameCode) {
  const gamesCollection = getGamesCollection()

  // Validate name
  if (name == null || name === '') {
    throw new UserException('Must enter a name')
  } else if (name.length > 20) {
    throw new UserException('Max name length is 20 characters')
  }

  if (gameCode == null) {
    // Create game if doesn't exist
    gameCode = await createGame(db, gamesCollection)
  } else {
    // Validate gameCode
    gameCode = +(gameCode.replace(' ', ''))
    if (('' + gameCode).length > constants.GAME_CODE_LENGTH ||
      !Number.isInteger(gameCode) || gameCode < 0) {
      throw new UserException(
        `Game code must be ${constants.GAME_CODE_LENGTH} digit number.`
      )
    }
  }

  const gameDb = db.db('game-' + gameCode)

  const validationDocs = await Promise.all([
    gamesCollection.findOne({ code: gameCode }),
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').findOne({ name: name }),
    gameDb.collection('players').find({}).toArray()
  ])
  if (!validationDocs[0]) {
    throw new UserException(`The game ${gameCode} does not exist.`)
  } else if (validationDocs[1].playing !== false) {
    throw new UserException('Cannot join game. It is currently in progress.')
  } else if (validationDocs[2]) {
    throw new UserException(
      'Your chosen name is in use by another player. Please use another name.')
  } else if (validationDocs[3].length >= 10) {
    throw new UserException('There are already 10 players in this game')
  }

  const key = await randomBytesHexAsync(32)
  const hash = crypto.createHash('sha256')
  hash.update(key)
  await gameDb.collection('players').insertOne({
    name: name,
    gameCode: gameCode,
    hasConnected: false,
    order: validationDocs[3].length + 1,
    hashedKey: hash.digest('hex')
  })

  return {
    gameCode: gameCode,
    name: name,
    key: key
  }
}

module.exports = joinGame
