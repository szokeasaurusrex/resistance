'use strict'

/* global confirm */

import React from 'react'
import PageHeader from '../components/PageHeader.js'
import TeamInfo from '../components/TeamInfo.js'
import Overlay from '../components/Overlay.js'
import Spinner from '../components/Spinner.js'
import FontAwesomerIcon from '../components/FontAwesomerIcon.js'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { Row, Col, Button } from 'reactstrap'

export default class GameInProgress extends React.Component {
  constructor (props) {
    super(props)
    this.endRound = this.endRound.bind(this)
  }
  endRound () {
    if (confirm('Are you sure you want to end the round?')) {
      this.props.socketEmmitter('endRound', null, 'Ending round')
    }
  }
  render () {
    const {
      gameStatus,
      canHideTeam,
      myPlayer,
      socketEmmitter,
      ...rest } = this.props
    return (
      <div {...rest}>
        { process.env.NODE_ENV !== 'production' &&
          <p>Player name: {myPlayer.name}</p>
        }
        <PageHeader centering={false}>
          <TeamInfo
            canHideTeam={canHideTeam}
            myPlayer={myPlayer}
            gameStatus={gameStatus}
          />
        </PageHeader>
        <Row>
          <Col md='3'>
            <Button color='danger' size='lg' block onClick={this.endRound}>
              <FontAwesomerIcon icon={faTrashAlt} /> End round
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
