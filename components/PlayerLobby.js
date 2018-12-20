'use strict'

/* global confirm */

import React from 'react'
import { Table, Button, Row, Col } from 'reactstrap'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import {
  faTimes,
  faPencilAlt,
  faTrashAlt,
  faArrowRight,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons'

export default class PlayerLobby extends React.Component {
  constructor (props) {
    super(props)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
    this.handleEndGameClick = this.handleEndGameClick.bind(this)
    this.handleRoundStart = this.handleRoundStart.bind(this)
    this.handleSortClick = this.handleSortClick.bind(this)
  }
  handleRoundStart () {
    this.props.socketEmmitter('startRound', null, 'Starting game')
  }
  handleEndGameClick () {
    const confirmed = confirm('Are you sure you want to end the game?')
    if (confirmed) {
      this.props.socketEmmitter('deleteGame', null, 'Ending game')
    }
  }
  handleEditClick () {
    let newName = ''
    do {
      newName = window.prompt('Enter a new name:')
    } while (newName !== null &&
      (newName === '' || newName === this.props.myPlayer.name))

    if (newName != null) {
      this.props.socketEmmitter('changeName', {
        newName: newName
      }, 'Changing name')
    }
  }
  handleSortClick (...sortAction) {
    this.props.socketEmmitter('sortPlayer', sortAction, 'Reordering list')
  }
  handleRemoveClick (playerToRemove) {
    this.props.socketEmmitter('removalRequest', playerToRemove,
      'Removing player')
  }
  render () {
    const gameCodeLength = process.env.GAME_CODE_LENGTH
    const {
      children,
      gameCode,
      players,
      myPlayer,
      nameChanger,
      socketEmmitter,
      ...rest
    } = this.props
    let displayCode = gameCode + ''
    while (displayCode.length < gameCodeLength) {
      displayCode = '0' + displayCode
    }
    return (
      <div {...rest}>
        <p className='lead'>Game code: { displayCode }</p>
        { players.length === 1
          ? <p>1 player joined</p>
          : <p>{players.length} players joined</p>
        }
        <Table striped>
          <thead>
            <tr>
              <th width='100%'>Name</th>
              <th nowrap='true' className='text-align-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            { players.map((player, index) =>
              <tr key={player.name}>
                <td width='100%'>
                  {
                    player.name === myPlayer.name
                      ? <strong>{player.name}</strong>
                      : player.name
                  }
                  { player.name === myPlayer.name &&
                    <Button color='link'
                      onClick={this.handleEditClick}>
                      <FontAwesomerIcon icon={faPencilAlt} />
                    </Button>
                  }
                </td>
                <td nowrap='true' className='text-align-right'>

                  <span className='button-spacer' />
                  { index !== 0 &&
                    <Button color='link'
                      onClick={() => this.handleSortClick(player.name, 'up')}>
                      <FontAwesomerIcon icon={faArrowUp} />
                    </Button>
                  }
                  { index !== players.length - 1 &&
                    <Button color='link'
                      onClick={() => this.handleSortClick(player.name, 'down')}>
                      <FontAwesomerIcon icon={faArrowDown} />
                    </Button>
                  }
                  <Button color='link'
                    onClick={() => this.handleRemoveClick(player)}>
                    <FontAwesomerIcon icon={faTimes} />
                  </Button>
                </td>
              </tr>
            ) }
          </tbody>
        </Table>
        <Row>
          <Col lg='3' sm='5'>
            <Button color='dark' size='lg' block
              onClick={this.handleEndGameClick}>
              <FontAwesomerIcon icon={faTrashAlt} /> End game
            </Button>
            <br />
          </Col>
          <Col lg='6' xs='2' />
          <Col lg='3' sm='5'>
            <Button color='danger' size='lg' block
              disabled={players.length < 5} onClick={this.handleRoundStart}>
              Start game <FontAwesomerIcon icon={faArrowRight} />
            </Button>
            <br />
          </Col>
        </Row>

        <style jsx>{`
          .text-align-right {
            text-align: right;
          }
        `}</style>
      </div>
    )
  }
}
