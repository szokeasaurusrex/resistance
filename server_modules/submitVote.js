'use strict'

const UserException = require('./UserException.js')
const endVote = require('./endVote.js')

async function submitVote (gameDb, vote, player) {
  const [ status, votes ] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('votes').find().toArray()
  ])
  if (!status.voting) {
    throw new UserException('Voting is currently not in progress!')
  } else if (votes.some(vote => vote.name === player.name)) {
    throw new UserException('You have already voted!')
  } else if (!status.voting.isProposal &&
    !status.voting.missionList.includes(player.name)) {
    throw new UserException('You are not authorized to vote.')
  }
  await gameDb.collection('votes').insertOne({
    vote: vote,
    name: player.name
  })
  const numVotes = await gameDb.collection('votes').countDocuments({})
  if (numVotes === status.voting.numVotesNeeded) {
    await endVote(gameDb)
  }
}

module.exports = submitVote
