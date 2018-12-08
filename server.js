'use strict'

const server = require('express')()
const http = require('http').createServer(server)
const io = require('socket.io')(http)
const next = require('next')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const MongoClient = require('mongodb').MongoClient

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const gameCodeLength = 6
const mongoUrl = 'mongodb://localhost:27017'

class UserException extends Error {
  constructor (message, type) {
    super(message)
    this.message = message
    this.name = 'UserException'
    this.type = type || ''
  }
  toString () {
    return `Error: ${this.message}`
  }
  toJSON () {
    return {
      name: this.name,
      message: this.message,
      type: this.type
    }
  }
}

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

function handleSocketError (e, socket) {
  if (e instanceof UserException) {
    socket.emit('myError', e)
    if (e.type === 'authError') {
      socket.disconnect()
    }
  } else {
    console.error(e)
    socket.emit('myError', new UserException('An unexpected error occurred'))
  }
}

async function createGame (db, gamesCollection) {
  // Creates game and returns the code
  if (await gamesCollection.countDocuments() > 100000) {
    throw new Error('There are too many games in progress to start a new one.')
  }
  let gameCode
  do {
    gameCode = Math.floor(Math.random() * (10 ** gameCodeLength))
  } while (await gamesCollection.findOne({ code: gameCode }))
  await Promise.all([
    db.db('game-' + gameCode).collection('status').insertOne({
      playing: false,
      lastGameStart: new Date()
    }),
    gamesCollection.insertOne({
      code: gameCode
    })
  ])
  return gameCode
}

async function joinGame (db, name, gameCode, gamesCollection) {
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
    if (('' + gameCode).length > gameCodeLength ||
      !Number.isInteger(gameCode) || gameCode < 0) {
      throw new UserException(
        `Game code must be ${gameCodeLength} digit number.`
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

async function changeName (gameDb, currentName, newName) {
  if (currentName === newName) {
    throw new UserException('You entered the same name as your current name')
  } else if (newName === '') {
    throw new UserException('You cannot have a blank name')
  }
  const status = await gameDb.collection('status').findOne({})
  if (status.playing) {
    throw new UserException('Cannot changle player name while game in progress')
  }
  const query = { name: currentName }
  const mongoPlayer = await gameDb.collection('players').findOne(query)
  if (!mongoPlayer) {
    throw new UserException('Your current player does not exist')
  }
  await gameDb.collection('players').updateOne(query, {
    $set: {
      name: newName
    }
  })
  return newName
}

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

async function runApp () {
  try {
    await app.prepare()

    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(bodyParser.json())

    const db = await MongoClient.connect(mongoUrl, { useNewUrlParser: true })
    const gamesCollection = db.db('games').collection('games')

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    // create or join game
    server.post('/join', async (req, res) => {
      try {
        const { playerName } = req.body
        let { gameCode } = req.body

        // Join game, send name and key to client
        res.json(await joinGame(db, playerName, gameCode, gamesCollection))
      } catch (e) {
        if (e instanceof UserException || dev) {
          res.json({ error: e })
          if (!(e instanceof UserException)) {
            console.error(e)
          }
        } else {
          res.status(500).json({
            error: new Error(
              'An unexpected error occurred while processing your request'
            )
          })
          console.error(e)
        }
      }
    })

    // Delete game after certain amount of time
    const msToLive = process.env.NODE_ENV === 'production' ? 86400000 : 1800000
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
            currentDate - game.status.lastGameStart > msToLive)
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
    }, msToLive)

    const sockets = {}
    io.on('connection', socket => {
      let player = {
        authenticated: false
      }
      let gameDb, roomAll

      socket.on('authRequest', async authKey => {
        try {
          gameDb = db.db('game-' + authKey.gameCode)
          const authReply = await authUser(gameDb, gamesCollection,
            socket.client.id, authKey)
          player = authReply
          const roomAllName = `game-${player.gameCode}-all`
          socket.join(roomAllName)
          if (!sockets[player.gameCode]) {
            sockets[player.gameCode] = {}
          }
          sockets[player.gameCode][player.name] = socket
          if (player.hasConnected) {
            socket.emit('gameStatus', await getGameStatus(gameDb))
          }
          roomAll = io.to(roomAllName)
          roomAll.emit('gameStatus', await getGameStatus(gameDb))
        } catch (e) {
          handleSocketError(e, socket)
        }
      })

      socket.on('changeName', async msg => {
        if (player.authenticated) {
          try {
            const oldName = player.name
            player.name = await changeName(gameDb, player.name, msg.newName)
            sockets[player.gameCode][player.name] = socket
            delete sockets[player.gameCode][oldName]
            socket.emit('nameChanged', msg)
            roomAll.emit('gameStatus', await getGameStatus(gameDb))
          } catch (e) {
            handleSocketError(e, socket)
          }
        }
      })

      socket.on('removalRequest', async playerToRemove => {
        if (player.authenticated) {
          try {
            const result = await removePlayer(gameDb, gamesCollection,
              playerToRemove)
            roomAll.emit('removedPlayer', result.playerToRemove)
            const removedSocket = sockets[player.gameCode][playerToRemove.name]
            if (removedSocket) {
              removedSocket.emit('kicked')
              removedSocket.disconnect()
              delete sockets[player.gameCode][playerToRemove.name]
            }
            if (Object.keys(sockets[player.gameCode]).length === 0) {
              delete sockets[player.gameCode]
            } else {
              roomAll.emit('gameStatus', await getGameStatus(gameDb))
            }
          } catch (e) {
            handleSocketError(e, socket)
          }
        }
      })

      socket.on('deleteGame', async () => {
        if (player.authenticated) {
          try {
            await Promise.all([
              gameDb.dropDatabase(),
              gamesCollection.removeOne({ code: player.gameCode })
            ])
            roomAll.emit('kicked')
            for (const playerName in sockets[player.gameCode]) {
              sockets[player.gameCode][playerName].disconnect()
            }
            delete sockets[player.gameCode]
          } catch (e) {
            handleSocketError(e, socket)
          }
        }
      })
    })

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
