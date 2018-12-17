'use strict'

import React from 'react'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'

export default class NextMissionLeaders extends React.Component {
  render () {
    const listSize = 3
    const {
      players,
      myPlayer,
      missionChooserIndex,
      missionFailIndex,
      children,
      ...rest
    } = this.props
    const nextLeaders = []
    let playerIndex = missionChooserIndex
    for (let i = 0; i < listSize; i++) {
      playerIndex = (playerIndex + 1) % players.length
      nextLeaders.push({
        name: players[playerIndex].name,
        mustPass: (playerIndex === missionFailIndex)
      })
    }
    return (
      <div {...rest}>
        <h5>Next mission leaders</h5>
        <ol>
          { nextLeaders.map(leader => (
            <li key={leader.name}>
              {leader.name === myPlayer.name
                ? <strong>Me </strong> : leader.name + ' '}
              {leader.mustPass &&
                <FontAwesomerIcon icon={faUserSecret} />
              }
            </li>
          ))}
        </ol>
        <p className='small'>
          <FontAwesomerIcon icon={faUserSecret} /> indicates that mission must
          pass, or else spies will earn a point.
        </p>
      </div>
    )
  }
}
