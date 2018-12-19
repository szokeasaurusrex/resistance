'use strict'

const server = require('express')()
const http = require('http').createServer(server)
const io = require('socket.io')(http)
const initDb = require('./server_modules/db.js').initDb
const handleExpressRequests =
  require('./server_modules/handleExpressRequests')
const handleSocketConnections =
  require('./server_modules/handleSocketConnections.js')

async function runApp () {
  try {
    await initDb()

    await handleExpressRequests(server)

    handleSocketConnections(io)

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
