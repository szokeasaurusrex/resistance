'use strict'

import React from 'react'
import { Card, CardBody, CardTitle } from 'reactstrap'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
import ProposeMissionForm from './ProposeMissionForm.js'
import MissionDraftProposal from './MissionDraftProposal.js'
import NextMissionLeaders from './NextMissionLeaders'

export default class Mission extends React.Component {
  render () {
    const {
      myPlayer,
      gameStatus,
      socketEmmitter,
      draftProposal,
      voting,
      children,
      ...rest
    } = this.props
    const {
      players,
      missions,
      missionChooserIndex,
      missionFailIndex,
      missionNumber
    } = gameStatus
    const missionChooser = players[missionChooserIndex].name
    const mustPass = (missionChooserIndex === missionFailIndex)
    const missionSize = missions.order[missionNumber]
    const starRound = (missions.includesStarRound && missionNumber === 3)

    return (
      <Card {...rest}>
        <CardBody>
          <CardTitle>Mission #{ missionNumber + 1 }</CardTitle>
          { mustPass &&
            <strong>
              <FontAwesomerIcon icon={faUserSecret} /> Spies win game if
              mission fails to pass!
              <br />
            </strong>
          }

          { starRound &&
            <strong>
              2 must sabotage for mission to fail!<br />
            </strong>
          }

          { missionSize } players
          <br />

          Proposer: {
            myPlayer.name === missionChooser
              ? <strong>Me</strong>
              : missionChooser
          }
          <hr />
          { !voting && (myPlayer.name === missionChooser
            ? (
              <div>
                <ProposeMissionForm
                  players={players}
                  myPlayer={myPlayer}
                  socketEmmitter={socketEmmitter}
                  missionSize={missionSize}
                />
                <hr />
              </div>
            )
            : (draftProposal.length > 0 &&
              <div>
                <MissionDraftProposal
                  draftProposal={draftProposal}
                  myPlayer={myPlayer}
                />
                <hr />
              </div>
            )
          )}
          {
            <NextMissionLeaders
              players={players}
              myPlayer={myPlayer}
              missionChooserIndex={missionChooserIndex}
              missionFailIndex={missionFailIndex}
            />
          }
        </CardBody>
      </Card>
    )
  }
}
