'use strict'

const server = require('express')()
const http = require('http').createServer(server)
const io = require('socket.io')(http)
const next = require('next')
const bodyParser = require('body-parser')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

async function runApp() {
  try {
    await app.prepare()

    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(bodyParser.json())

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

    http.listen(process.env.PORT || 3000, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
  } catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
}

runApp()
