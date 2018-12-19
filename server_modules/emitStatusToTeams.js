'use strict'

async function emitStatusToTeams (sockets, status) {
  const resistanceSockets = Object.assign({}, sockets)
  for (const spy of status.spies) {
    sockets[spy].emit('gameStatus', status)
    delete resistanceSockets[spy]
  }
  delete status.spies
  for (const player in resistanceSockets) {
    sockets[player].emit('gameStatus', status)
  }
}

module.exports = emitStatusToTeams
