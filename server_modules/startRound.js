'use strict'

const UserException = require('./UserException.js')

async function startRound (gameDb) {
  const [gameStatus, playerList] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').find().toArray()
  ])
  if (gameStatus.playing) {
    throw new UserException('Cannot start game. Game is in progress.')
  }

  const numPlayers = playerList.length
  const missions = {
    order: [],
    includesStarRound: false // Star rounds always occur in mission no. 3.
  }
  switch (numPlayers) {
    case 5:
      missions.order = [2, 3, 2, 3, 3]
      break
    case 6:
      missions.order = [2, 3, 4, 3, 4]
      break
    case 7:
      missions.order = [2, 3, 3, 4, 4]
      missions.includesStarRound = true
      break
    case 8:
    case 9:
    case 10:
      missions.order = [3, 4, 4, 5, 5]
      missions.includesStarRound = true
      break
    default:
      throw new UserException('Cannot start game. There must by 5-10 players.')
  }

  const numSpies = Math.ceil(numPlayers / 3)
  const playerNameList = playerList.map(player => player.name)
  const teams = {
    resistance: playerNameList,
    spies: []
  }
  for (let i = 0; i < numSpies; i++) {
    let randIndex = Math.floor(Math.random() * teams.resistance.length)
    teams.spies.push(...teams.resistance.splice(randIndex, 1))
  }
  const missionChooserIndex = Math.floor(Math.random() * numPlayers)
  const newStatus = {
    playing: true,
    lastGameStart: new Date(),
    numPlayers: numPlayers,
    numSpies: numSpies,
    missionChooserIndex: missionChooserIndex,
    missionFailIndex: (missionChooserIndex + 2) % numPlayers,
    missionNumber: 0,
    missions: missions,
    scores: {
      resistance: 0,
      spies: 0
    }
  }
  await Promise.all([
    gameDb.collection('teams').insertOne(teams),
    gameDb.collection('status').updateOne({}, { $set: newStatus })
  ])
}

module.exports = startRound
