'use strict'

const getDb = require('./db.js').getDb
const getGamesCollection = require('./db.js').getGamesCollection
const authUser = require('./authUser.js')
const getGameStatus = require('./getGameStatus.js')
const changeName = require('./changeName.js')
const removePlayer = require('./removePlayer.js')
const handleSocketError = require('./handleSocketError.js')
const startRound = require('./startRound.js')
const endRound = require('./endRound.js')
const periodicallyDeleteGames = require('./periodicallyDeleteGames.js')

function handleSocketConnections (io) {
  const db = getDb()
  const gamesCollection = getGamesCollection()

  const sockets = {}
  io.on('connection', socket => {
    let player = {
      authenticated: false
    }
    let gameDb, roomAll, roomSpies, roomResistance, gameCode, gameDashCode

    socket.on('authRequest', async authKey => {
      try {
        gameCode = authKey.gameCode
        gameDashCode = 'game-' + gameCode
        gameDb = db.db(gameDashCode)
        player = await authUser(gameDb, socket.client.id, authKey)
        socket.join(gameDashCode)
        roomAll = gameDashCode
        roomSpies = gameDashCode + '-spies'
        roomResistance = gameDashCode + '-resistance'
        if (!sockets[gameCode]) {
          sockets[gameCode] = {}
        }
        sockets[gameCode][player.name] = socket
        if (player.hasConnected) {
          socket.emit('gameStatus', await getGameStatus(gameDb, player.name))
        } else {
          io.to(roomAll).emit('gameStatus', await getGameStatus(gameDb))
        }
        socket.emit('actionCompleted')
      } catch (e) {
        handleSocketError(e, socket)
      }
    })

    socket.on('changeName', async msg => {
      if (player.authenticated) {
        try {
          const oldName = player.name
          player.name = await changeName(gameDb, player.name, msg.newName)
          sockets[gameCode][player.name] = socket
          delete sockets[gameCode][oldName]
          socket.emit('nameChanged', msg)
          io.to(roomAll).emit('gameStatus', await getGameStatus(gameDb))
          socket.emit('actionCompleted')
        } catch (e) {
          handleSocketError(e, socket)
        }
      }
    })

    socket.on('startRound', async () => {
      if (player.authenticated) {
        try {
          socket.broadcast.to(roomAll).emit('loading', 'Starting game')
          const teams = await startRound(gameDb)
          for (const spy of teams.spies) {
            sockets[gameCode][spy].join(gameDashCode + '-spies')
          }
          for (const resister of teams.resistance) {
            sockets[gameCode][resister].join(gameDashCode + '-resistance')
          }
          const status = await getGameStatus(gameDb)
          io.to(roomSpies).emit('gameStatus', status)
          delete status.spies
          io.to(roomResistance).emit('gameStatus', status)
          io.to(roomAll).emit('gameStarted')
        } catch (e) {
          handleSocketError(e, socket)
        } finally {
          io.to(roomAll).emit('actionCompleted')
        }
      }
    })

    socket.on('endRound', async () => {
      if (player.authenticated) {
        try {
          socket.broadcast.to(roomAll).emit('loading', 'Ending round')
          const teams = await endRound(gameDb)
          for (const spy of teams.spies) {
            sockets[gameCode][spy].leave(gameDashCode + '-spies')
          }
          for (const resister of teams.resistance) {
            sockets[gameCode][resister].leave(gameDashCode + '-resistance')
          }
          io.to(roomAll).emit('gameStatus', await getGameStatus(gameDb))
        } catch (e) {
          handleSocketError(e, socket)
        } finally {
          io.to(roomAll).emit('actionCompleted')
        }
      }
    })

    socket.on('removalRequest', async playerToRemove => {
      if (player.authenticated) {
        try {
          const result = await removePlayer(gameDb, playerToRemove)
          io.to(roomAll).emit('removedPlayer', result.playerToRemove)
          const removedSocket = sockets[gameCode][playerToRemove.name]
          if (removedSocket) {
            removedSocket.emit('kicked')
            removedSocket.disconnect()
            delete sockets[gameCode][playerToRemove.name]
          }
          if (Object.keys(sockets[gameCode]).length === 0) {
            delete sockets[gameCode]
          } else {
            io.to(roomAll).emit('gameStatus', await getGameStatus(gameDb))
            socket.emit('actionCompleted')
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
            gamesCollection.removeOne({ code: gameCode })
          ])
          io.to(roomAll).emit('kicked')
          for (const playerName in sockets[gameCode]) {
            sockets[gameCode][playerName].disconnect()
          }
          delete sockets[gameCode]
        } catch (e) {
          handleSocketError(e, socket)
        }
      }
    })
  })

  periodicallyDeleteGames(deletedGames => {
    for (const game of deletedGames) {
      if (sockets[game]) delete sockets[game]
    }
  })
}

module.exports = handleSocketConnections
