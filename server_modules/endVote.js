'use strict'

const UserException = require('./UserException.js')
const startVote = require('./startVote.js')
const startNextMission = require('./startNextMission.js')

async function endVote (gameDb) {
  const [ status, votes ] = await Promise.all([
    gameDb.collection('status').findOne({}),
    gameDb.collection('votes').find().toArray()
  ])
  if (!status.voting) {
    throw new UserException('Cannot end vote. The vote is not in progress.')
  }
  const noVotes = votes.filter(vote => vote.vote === false).length
  const yesVotes = votes.length - noVotes
  const voteData = {
    missionNumber: status.missionNumber,
    tally: {
      yes: yesVotes,
      no: noVotes
    },
    ...status.voting
  }
  let mongoCommands = []
  if (status.voting.isProposal) {
    if (yesVotes > noVotes) {
      const newVote = Object.assign({}, status.voting)
      newVote.isProposal = false
      mongoCommands.push(startVote(gameDb, newVote, true))
    } else if (status.missionChooserIndex === status.missionFailIndex) {
      const newScores = {
        resistance: status.scores.resistance,
        spies: status.scores.spies + 1
      }
      await gameDb.collection('status').updateOne({}, {
        $set: { scores: newScores },
        $unset: { voting: '' }
      })
      mongoCommands.push(startNextMission(gameDb, status, newScores))
    } else {
      const newIndex = (status.missionChooserIndex + 1) % status.numPlayers
      mongoCommands.push(gameDb.collection('status').updateOne({}, {
        $set: { missionChooserIndex: newIndex },
        $unset: { voting: '' }
      }))
    }
    mongoCommands.push(
      gameDb.collection('status').updateOne({}, {
        $set: {
          'voteResults.proposal': {
            votes: votes,
            passed: yesVotes > noVotes,
            ...voteData
          }
        }
      })
    )
  } else {
    delete voteData.votes
    const isStarRound = (
      status.missionNumber === 3 && status.missions.includesStarRound === true
    )
    const failed = (!isStarRound && noVotes > 0) || noVotes > 1
    let newScores
    if (failed) {
      newScores = {
        resistance: status.scores.resistance,
        spies: status.scores.spies + 1
      }
    } else {
      newScores = {
        resistance: status.scores.resistance + 1,
        spies: status.scores.spies
      }
    }
    mongoCommands.push(
      gameDb.collection('status').updateOne({}, {
        $set: {
          scores: newScores,
          'voteResults.mission': { passed: !failed, ...voteData }
        },
        $unset: { voting: '' }
      }),
      startNextMission(gameDb, status, newScores)
    )
  }
  await Promise.all(mongoCommands)
}

module.exports = endVote
