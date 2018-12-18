'use strict'

/* global confirm */

import React from 'react'
import TeamInfo from './TeamInfo.js'
import Mission from './Mission.js'
import Vote from './Vote.js'
import Scores from './Scores.js'
import MissionReference from './MissionReference.js'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { Row, Col, Button } from 'reactstrap'

export default class GameInProgress extends React.Component {
  constructor (props) {
    super(props)
    this.endRound = this.endRound.bind(this)
  }
  endRound () {
    if (this.props.gameStatus.winner ||
      confirm('Are you sure you want to end the round?')) {
      this.props.socketEmmitter('endRound', null, 'Ending round')
    }
  }
  render () {
    const {
      gameStatus,
      canHideTeam,
      myPlayer,
      socketEmmitter,
      draftProposal,
      ...rest
    } = this.props
    const voting = gameStatus.voting

    return (
      <div {...rest}>
        { process.env.NODE_ENV !== 'production' &&
          <p>Player name: {myPlayer.name}</p>
        }
        <Scores
          gameStatus={gameStatus}
        />
        <hr />
        <TeamInfo
          canHideTeam={canHideTeam}
          myPlayer={myPlayer}
          gameStatus={gameStatus}
        />
        <br />
        { voting && !gameStatus.winner &&
          <div>
            <Vote
              voting={voting}
              socketEmmitter={socketEmmitter}
              myPlayer={myPlayer}
            />
            <br />
          </div>
        }
        { canHideTeam && !gameStatus.winner &&
          <div>
            <Mission
              myPlayer={myPlayer}
              gameStatus={gameStatus}
              draftProposal={draftProposal}
              socketEmmitter={socketEmmitter}
              voting={voting}
            />
            <br />
            <MissionReference
              missions={gameStatus.missions}
            />
          </div>
        }
        <hr />
        <br />
        <Row>
          <Col md='3'>
            <Button color='dark' size='lg' block onClick={this.endRound}>
              <FontAwesomerIcon icon={faTrashAlt} /> End round
            </Button>
          </Col>
        </Row>
        <br />
      </div>
    )
  }
}
