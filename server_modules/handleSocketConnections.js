'use strict'

const getDb = require('./db.js').getDb
const getGamesCollection = require('./db.js').getGamesCollection
const authUser = require('./authUser.js')
const getGameStatus = require('./getGameStatus.js')
const changeName = require('./changeName.js')
const removePlayer = require('./removePlayer.js')
const handleSocketError = require('./handleSocketError.js')

function handleSocketConnections (io) {
  const db = getDb()
  const gamesCollection = getGamesCollection()

  const sockets = {}
  io.on('connection', socket => {
    let player = {
      authenticated: false
    }
    let gameDb, roomAll, gameCode, gameDashCode

    socket.on('authRequest', async authKey => {
      try {
        gameCode = authKey.gameCode
        gameDashCode = 'game-' + gameCode
        gameDb = db.db(gameDashCode)
        const player = await authUser(gameDb, socket.client.id, authKey)
        socket.join(gameDashCode)
        roomAll = io.to(gameDashCode)
        if (!sockets[gameCode]) {
          sockets[gameCode] = {}
        }
        roomAll = io.to(gameDashCode)
        sockets[gameCode][player.name] = socket
        if (player.hasConnected) {
          socket.emit('gameStatus', await getGameStatus(gameDb))
        }
        roomAll.emit('gameStatus', await getGameStatus(gameDb))
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
          roomAll.emit('gameStatus', await getGameStatus(gameDb))
          socket.emit('actionCompleted')
        } catch (e) {
          handleSocketError(e, socket)
        }
      }
    })

    socket.on('removalRequest', async playerToRemove => {
      if (player.authenticated) {
        try {
          const result = await removePlayer(gameDb, playerToRemove)
          roomAll.emit('removedPlayer', result.playerToRemove)
          const removedSocket = sockets[gameCode][playerToRemove.name]
          if (removedSocket) {
            removedSocket.emit('kicked')
            removedSocket.disconnect()
            delete sockets[gameCode][playerToRemove.name]
          }
          if (Object.keys(sockets[gameCode]).length === 0) {
            delete sockets[gameCode]
          } else {
            roomAll.emit('gameStatus', await getGameStatus(gameDb))
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
          roomAll.emit('kicked')
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
}

module.exports = handleSocketConnections
