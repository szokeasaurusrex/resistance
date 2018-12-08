'use strict'

const bodyParser = require('body-parser')
const next = require('next')
const getDb = require('./db.js').getDb
const joinGame = require('./joinGame.js')
const UserException = require('./UserException.js')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

async function handleExpressRequests (server) {
  const db = getDb()

  await app.prepare()

  server.use(bodyParser.urlencoded({ extended: false }))
  server.use(bodyParser.json())

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  // create or join game
  server.post('/join', async (req, res) => {
    try {
      const { playerName } = req.body
      let { gameCode } = req.body

      // Join game, send name and key to client
      const gamesCollection = db.db('games').collection('games')
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
}

module.exports = handleExpressRequests
