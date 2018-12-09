'use strict'

const UserException = require('./UserException.js')

async function startRound (gameDb) {
  const [gameStatus, playerList] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').find({}).toArray()
  ])
  const numPlayers = playerList.length
  if (gameStatus.playing) {
    throw new UserException('Cannot start game. Game is in progress.')
  } else if (numPlayers < 5 || numPlayers > 10) {
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
    missionChooserIndex: missionChooserIndex,
    missionFailIndex: (missionChooserIndex + 3) % numPlayers,
    missionNumber: 0,
    scores: {
      resistance: 0,
      spies: 0
    }
  }
  await Promise.all([
    gameDb.collection('teams').insertOne(teams),
    gameDb.collection('status').updateOne({}, { $set: newStatus })
  ])
  return teams
}

module.exports = startRound
