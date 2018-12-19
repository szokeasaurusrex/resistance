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
    missionChooserIndex = (missionChooserIndex + 1) % numPlayers
    const missionFailIndex = (missionChooserIndex + 2) % numPlayers
    await gameDb.collection('status').updateOne({}, {
      $set: {
        missionChooserIndex: missionChooserIndex,
        missionFailIndex: missionFailIndex,
        missionNumber: missionNumber + 1
      }
    })
  }
}

module.exports = startNextMission
