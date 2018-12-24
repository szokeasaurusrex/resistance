'use strict'

async function startNextMission (gameDb, status, newScores) {
  if (newScores.spies === 3) {
    await gameDb.collection('status').updateOne({}, {
      $set: { winner: 'spies' }
    })
  } else if (newScores.resistance === 3) {
    await gameDb.collection('status').updateOne({}, {
      $set: { winner: 'resistance' }
    })
  } else {
    let { missionChooserIndex, numPlayers, missionNumber } = status
    if (missionNumber >= 4) {
      throw new Error('It is the last mission and no one has won!')
    }
    let inquisitor
    if (status.options.inquisitor) {
      inquisitor = status.inquisitor
      if (missionNumber === status.inquisitor.afterMissionNumber) {
        inquisitor.waiting = true
      }
    }
    missionChooserIndex = (missionChooserIndex + 1) % numPlayers
    const missionFailIndex = (missionChooserIndex + 4) % numPlayers
    await gameDb.collection('status').updateOne({}, {
      $set: {
        missionChooserIndex: missionChooserIndex,
        missionFailIndex: missionFailIndex,
        missionNumber: missionNumber + 1,
        inquisitor: inquisitor
      }
    })
  }
}

module.exports = startNextMission
