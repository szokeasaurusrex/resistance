'use strict'

const UserException = require('./UserException.js')

async function inquisitorInspect (gameDb, inquisitorName, playerToInspect) {
  const [ status, players, teams ] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').find().toArray(),
    gameDb.collection('teams').findOne()
  ])
  if (!status.options.inquisitor) {
    throw new UserException('Inquisitor is not enabled')
  } else if (status.inquisitor.current !== inquisitorName) {
    throw new UserException('You are not the inquisitor')
  } else if (!players.some(player => player.name === playerToInspect)) {
    throw new UserException(
      'The player you are trying to inpect does not exist'
    )
  } else if (status.inquisitor.previous.includes(playerToInspect)) {
    throw new UserException(
      'You cannot inspect a player who has been inquisitor'
    )
  }

  const previous = status.inquisitor.previous
  previous.push(inquisitorName)

  const newInquisitor = {
    afterMissionNumber: status.inquisitor.afterMissionNumber + 1,
    waiting: false,
    current: playerToInspect,
    previous: previous
  }

  await gameDb.collection('status').updateOne({}, {
    $set: { inquisitor: newInquisitor }
  })

  if (teams.spies.includes(playerToInspect)) {
    return {
      name: playerToInspect,
      team: 'spies'
    }
  } else {
    return {
      name: playerToInspect,
      team: 'resistance'
    }
  }
}

module.exports = inquisitorInspect
