'use strict'

const server = require('express')()
const http = require('http').createServer(server)
const io = require('socket.io')(http)
const next = require('next')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const hash = crypto.createHash('sha256')
const MongoClient = require('mongodb').MongoClient

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const maxGameCode = 1000000 // noninclusive
const minGameCode = 0 // inclusive
const mongoUrl = 'mongodb://localhost:27017'

class UserException {
  constructor(message) {
    this.message = message
    this.name = 'UserException'
  }
  toString() {
    return `Error: ${ this.message }`
  }
}

function randomBytesHexAsync(size) {
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

async function createGame(db, gamesCollection) {
  // Creates game and returns the code
  if (await gamesCollection.countDocuments() > 100000) {
    throw new Error('There are too many games in progress to start a new one.')
  }
  let gameCode, gameDbName
  do {
    gameCode = (
      Math.floor(Math.random() * (maxGameCode - minGameCode)) + minGameCode
    )
  } while (await gamesCollection.findOne({ code: gameCode }))
  console.log(gameCode)
  await Promise.all([
    db.db('game-' + gameCode).collection('status').insertOne({
      playing: false,
      lastSignificantChange: new Date()
      // Significant changes are creating game, strating round, ending round
    }),
    gamesCollection.insertOne({
      code: gameCode
    })
  ])
  return gameCode
}

async function joinGame(db, name, gameCode, gamesCollection) {
  const gameDb = db.db('game-' + gameCode)

  const validationDocs = await Promise.all([
    gamesCollection.findOne({ code: parseInt(gameCode) }),
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').findOne({ name: name })
  ])
  if (!validationDocs[0]) {
    throw new UserException(`The game ${ gameCode } does not exist.`)
  } else if (validationDocs[1].playing !== false) {
    throw new UserException('Cannot join game. It is currently in progress.')
  } else if (validationDocs[2]) {
    throw new UserException(
      'Your chosen name is in use by another player. Please use another name.')
  }

  const key = await randomBytesHexAsync(32)
  hash.update(key)
  await gameDb.collection('players').insertOne({
    name: name,
    hashedKey: hash.digest('hex')
  })

  return {
    gameCode: gameCode,
    name: name,
    key: key
  }
}

async function runApp() {
  try {
    await app.prepare()

    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(bodyParser.json())

    const db = await MongoClient.connect(mongoUrl, {useNewUrlParser: true})

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.post('/game', (req, res) => {
      const { action, name, code } = req.body
      console.log('Action: ' + action)
      console.log('Name: ' + name)
      console.log('Code: ' + code)
      return handle(req, res)
    })

    // create or join game
    server.post('/join', async (req, res) => {
      try {
        const { playerName } = req.body
        let { gameCode } = req.body
        // const dbList = (await db.db('games').collection('games').findOn)).databases
        const gamesCollection = db.db('games').collection('games')

        // Validate playerName
        if (playerName == null || playerName == "") {
          throw new UserException("Must enter a name")
        } else if (playerName.length > 20) {
          throw new UserException("Max name length is 20 characters")
        }

        // Validate gameCode
        if (gameCode != null && (gameCode < minGameCode ||
            gameCode >= maxGameCode )) {
          throw new UserException(`Game code must be integer between
                ${ minGameCode } (inclusive) and ${ maxGameCode } (exclusive).`)
        }

        // Create game if doesn't exist
        if (gameCode == null) {
          gameCode = await createGame(db, gamesCollection)
        }

        // Join game, send name and key to client
        res.json(await joinGame(db, playerName, gameCode, gamesCollection))

      } catch (e) {
        if (e instanceof UserException || dev) {
          res.json({ error: e })
          if (!(e instanceof UserException)) {
            console.error(e)
          }
        } else {
          res.status(500)
          res.json({
            error: new Error(
              'An unexpected error occurred while processing your request'
            )
          })
          console.error(e)
        }
      }
    })

    // Delete game after certain amount of time
    const msToLive = 86400000
    setInterval(async () => {
      const gamesCollection = db.db('games').collection('games')
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
      const currentDate = new Date()
      let dropCommands = []
      gameStatuses.forEach(game => {
        if (currentDate - game.status.lastSignificantChange > msToLive) {
          dropCommands.push(db.db('game-' + game.code).dropDatabase())
          dropCommands.push(gamesCollection.deleteOne({code: game.code}))
          console.log("Deleted game " + game.code)
        }
      })
      await Promise.all(dropCommands)
    }, msToLive)

    http.listen(process.env.PORT || 3000, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
  } catch (e) {
    console.error(e.stack)
    process.exit(1)
  }
}

runApp()
