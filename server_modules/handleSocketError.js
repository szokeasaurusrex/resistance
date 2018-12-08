'use strict'

const UserException = require('./UserException.js')

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

module.exports = handleSocketError
