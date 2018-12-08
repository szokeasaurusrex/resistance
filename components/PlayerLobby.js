'use strict'

/* global confirm */

import React from 'react'
import { Table, Button, Row, Col } from 'reactstrap'
import FontAwesomerIcon from '../components/FontAwesomerIcon.js'
import { faTimes,
  faPencilAlt,
  faTrashAlt,
  faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default class PlayerLobby extends React.Component {
  constructor (props) {
    super(props)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
    this.handleEndGameClick = this.handleEndGameClick.bind(this)
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
  handleRemoveClick (playerToRemove) {
    this.props.socketEmmitter('removalRequest', playerToRemove,
      'Removing player')
  }
  render () {
    const gameCodeLength = 6
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
              <th nowrap='true'>Actions</th>
            </tr>
          </thead>
          <tbody>
            { players.map(player =>
              <tr key={player.name}>
                <td width='100%'>
                  {
                    player.name === myPlayer.name
                      ? <strong>{player.name} (me)</strong>
                      : player.name
                  }
                </td>
                <td nowrap='true' className='text-align-right'>
                  { player.name === myPlayer.name &&
                    <span className='edit-btn-container'>
                      <Button color='primary' onClick={this.handleEditClick}>
                        <FontAwesomerIcon icon={faPencilAlt} />
                      </Button>
                    </span>
                  }
                  <Button color='danger' onClick={
                    () => this.handleRemoveClick(player)
                  }>
                    <FontAwesomerIcon icon={faTimes} />
                  </Button>
                </td>
              </tr>
            ) }
          </tbody>
        </Table>
        <Row>
          <Col lg='3' sm='5'>
            <Button color='danger' size='lg' block
              onClick={this.handleEndGameClick}>
              <FontAwesomerIcon icon={faTrashAlt} /> End game
            </Button>
            <br />
          </Col>
          <Col lg='6' xs='2' />
          <Col lg='3' sm='5'>
            <Button color='success' size='lg' block
              disabled={players.length < 5} onClick={this.handleRoundStart}>
              Start game <FontAwesomerIcon icon={faArrowRight} />
            </Button>
          </Col>
        </Row>

        <style jsx>{`
          .text-align-right {
            text-align: right;
          }
          .edit-btn-container {
            margin-right: 5px;
          }
        `}</style>
      </div>
    )
  }
}
