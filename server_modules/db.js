'use strict'

const assert = require('assert')
const constants = require('../constants.js')
const MongoClient = require('mongodb').MongoClient

let db

async function initDb () {
  if (db) {
    console.warn('Attempting to init DB again')
    return db
  }
  db = await MongoClient.connect(constants.MONGO_URL, {
    useNewUrlParser: true
  })
}

function getDb () {
  assert.ok(db, 'Must init DB before trying to get DB')
  return db
}

exports.initDb = initDb
exports.getDb = getDb
