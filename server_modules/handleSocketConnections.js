'use strict'

const UserException = require('./UserException.js')
const getDb = require('./db.js').getDb
const getGamesCollection = require('./db.js').getGamesCollection
const authUser = require('./authUser.js')
const getGameStatus = require('./getGameStatus.js')
const changeName = require('./changeName.js')
const changeOptions = require('./changeOptions.js')
const sortPlayer = require('./sortPlayer.js')
const removePlayer = require('./removePlayer.js')
const handleSocketError = require('./handleSocketError.js')
const startRound = require('./startRound.js')
const startVote = require('./startVote.js')
const submitVote = require('./submitVote.js')
const endRound = require('./endRound.js')
const emitStatusToTeams = require('./emitStatusToTeams.js')
const periodicallyDeleteGames = require('./periodicallyDeleteGames.js')

function handleSocketConnections (io) {
  const db = getDb()
  const gamesCollection = getGamesCollection()

  const sockets = {}
  const missionChoosers = {}
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
        player = await authUser(gameDb, socket.client.id, authKey)
        socket.join(gameDashCode)
        roomAll = gameDashCode
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

    socket.on('sortPlayer', async sortAction => {
      if (player.authenticated) {
        try {
          await sortPlayer(gameDb, ...sortAction)
          io.to(roomAll).emit('gameStatus', await getGameStatus(gameDb))
          socket.emit('actionCompleted')
        } catch (e) {
          handleSocketError(e, socket)
        }
      }
    })

    socket.on('changeOptions', async newOptions => {
      if (player.authenticated) {
        try {
          await changeOptions(gameDb, newOptions)
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
          await startRound(gameDb)
          const status = await getGameStatus(gameDb)
          emitStatusToTeams(sockets[gameCode], status)
          missionChoosers[gameCode] = status.players[status.missionChooserIndex]
          io.to(roomAll).emit('gameStarted')
        } catch (e) {
          handleSocketError(e, socket)
        } finally {
          io.to(roomAll).emit('actionCompleted')
        }
      }
    })

    socket.on('draftProposal', async playerList => {
      if (player.authenticated) {
        try {
          let isMissionChooser
          if (missionChoosers[gameCode] &&
            missionChoosers[gameCode].name === (player.name)) {
            isMissionChooser = true
          } else {
            let status = await getGameStatus(gameDb)
            const chooserName = status.players[status.missionChooserIndex].name
            isMissionChooser = (chooserName === player.name)
          }
          if (isMissionChooser) {
            socket.broadcast.to(roomAll).emit('draftProposal', playerList)
          }
        } catch (e) {
          handleSocketError(e, socket)
        }
      }
    })

    socket.on('finalProposal', async playerList => {
      if (player.authenticated) {
        try {
          let isMissionChooser
          let status = await getGameStatus(gameDb)
          const chooserName = status.players[status.missionChooserIndex].name
          isMissionChooser = (chooserName === player.name)
          if (!isMissionChooser) {
            throw new UserException('You are not the mission chooser!')
          }
          await startVote(gameDb, {
            isProposal: true,
            missionList: playerList
          })
          const newStatus = await getGameStatus(gameDb)
          emitStatusToTeams(sockets[gameCode], newStatus)
        } catch (e) {
          handleSocketError(e, socket)
        }
      }
    })

    socket.on('submitVote', async vote => {
      // vote is true or false, indicating yes or no vote
      if (player.authenticated) {
        try {
          await submitVote(gameDb, vote, player)
          emitStatusToTeams(sockets[gameCode], await getGameStatus(gameDb))
        } catch (e) {
          handleSocketError(e, socket)
        }
      }
    })

    socket.on('endRound', async () => {
      if (player.authenticated) {
        try {
          socket.broadcast.to(roomAll).emit('loading', 'Ending round')
          await endRound(gameDb)
          delete missionChoosers[gameCode]
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
          const result = await removePlayer(gameDb, playerToRemove.name)
          io.to(roomAll).emit('removedPlayer', result.playerRemoved)
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
      if (missionChoosers[game]) delete missionChoosers[game]
    }
  })
}

module.exports = handleSocketConnections
