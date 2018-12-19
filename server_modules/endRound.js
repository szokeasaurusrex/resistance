'use strict'

const UserException = require('./UserException.js')

async function endRound (gameDb) {
  const gameStatus = await gameDb.collection('status').findOne({})
  if (!gameStatus.playing) {
    throw new UserException('Cannot end round. No round is in progress.')
  }
  await Promise.all([
    gameDb.collection('status').updateOne({}, {
      $set: { playing: false },
      $unset: {
        voting: '',
        missionChooserIndex: '',
        missionFailIndex: '',
        missions: '',
        numPlayers: '',
        scores: '',
        missionNumber: '',
        winner: '',
        voteResults: ''
      }
    }),
    gameDb.collection('teams').drop()
  ])
}

module.exports = endRound
