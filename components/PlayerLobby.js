'use strict'

import React from 'react'
import { Table, Button } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons'

export default class PlayerLobby extends React.Component {
  constructor (props) {
    super(props)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
  }
  handleEditClick () {
    let newName = ''
    do {
      newName = window.prompt('Enter a new name:')
      if (newName === null) {
        break
      }
    } while (newName === '' || newName === this.props.myPlayer.name)
    if (newName != null) {
      this.props.socketEmmitter('changeName', {
        newName: newName
      })
    }
  }
  handleRemoveClick (playerToRemove) {
    this.props.socketEmmitter('removalRequest', playerToRemove)
  }
  render () {
    const {
      children,
      gameCode,
      players,
      myPlayer,
      nameChanger,
      socketEmmitter,
      ...rest
    } = this.props
    return (
      <div {...rest}>
        <p className='lead'>Game code: { gameCode }</p>
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
                      <Button color='success' onClick={this.handleEditClick}>
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </Button>
                    </span>
                  }
                  <Button color='danger' onClick={
                    () => this.handleRemoveClick(player)
                  }>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </td>
              </tr>
            ) }
          </tbody>
        </Table>

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
