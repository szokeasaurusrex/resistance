'use strict'

const UserException = require('./UserException.js')

async function changeName (gameDb, currentName, newName) {
  if (currentName === newName) {
    throw new UserException('You entered the same name as your current name')
  } else if (newName === '') {
    throw new UserException('You cannot have a blank name')
  }
  const status = await gameDb.collection('status').findOne({})
  if (status.playing) {
    throw new UserException('Cannot changle player name while game in progress')
  }
  const query = { name: currentName }
  const mongoPlayer = await gameDb.collection('players').findOne(query)
  if (!mongoPlayer) {
    throw new UserException('Your current player does not exist')
  }
  await gameDb.collection('players').updateOne(query, {
    $set: {
      name: newName
    }
  })
  return newName
}

module.exports = changeName
