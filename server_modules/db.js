'use strict'

const assert = require('assert')
const constants = require('../constants.js')
const MongoClient = require('mongodb').MongoClient

let db, gamesCollection

async function initDb () {
  if (db) {
    console.warn('Attempting to init DB again')
    return db
  }
  db = await MongoClient.connect(constants.MONGO_URL, {
    useNewUrlParser: true
  })
  gamesCollection = db.db('games').collection('games')
}

function getDb () {
  assert.ok(db, 'Must init DB before trying to get DB')
  return db
}

function getGamesCollection () {
  assert.ok(gamesCollection,
    'Must init DB before trying to get games collection')
  return gamesCollection
}

exports.initDb = initDb
exports.getDb = getDb
exports.getGamesCollection = getGamesCollection
