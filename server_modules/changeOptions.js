'use strict'

const UserException = require('./UserException.js')

async function changeOptions (gameDb, newOptions) {
  const status = await gameDb.collection('status').findOne({})
  if (status.playing) {
    throw new UserException('Cannot change options while game in progress.')
  }
  await gameDb.collection('status').updateOne({}, {
    $set: { options: newOptions }
  })
}

module.exports = changeOptions
