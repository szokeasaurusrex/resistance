'use strict'

const UserException = require('./UserException.js')

async function startVote (gameDb, vote, skipVotingCheck) {
  const [status, numPlayers] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('players').countDocuments({})
  ])
  if (status.voting && skipVotingCheck !== true) {
    throw new UserException('Voting is already in progress!')
  } else if (status.options.inquisitor && status.inquisitor.waiting) {
    throw new UserException('Cannot start mission while waiting for inquisitor')
  }
  if (vote.isProposal) {
    vote.numVotesNeeded = numPlayers
  } else {
    vote.numVotesNeeded = vote.missionList.length
  }
  await Promise.all([
    gameDb.collection('status').updateOne({}, {
      $set: {
        voting: {
          ...vote,
          voteId: Math.random().toString(16).substring(2)
        }
      }
    }),
    gameDb.collection('votes').deleteMany({})
  ])
}

module.exports = startVote
