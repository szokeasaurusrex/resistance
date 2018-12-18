'use strict'

import React from 'react'
import { Card, CardTitle, CardBody } from 'reactstrap'

export default class MissionReference extends React.Component {
  render () {
    const { missions, children, ...rest } = this.props
    return (
      <Card {...rest}>
        <CardBody>
          <CardTitle>Mission Reference</CardTitle>
          <p>
            <strong>Mission Order: </strong>
            { missions.order.map((numPlayers, missionNum) => (
              <span>
                { numPlayers }
                { missionNum === 3 && missions.includesStarRound && '*' }
                { missionNum !== missions.order.length - 1 && ', '}
              </span>
            )) }
          </p>
          { missions.includesStarRound &&
            <p className='small'>
              *In order for the spies to win this round, 2 spies must sabotage.
            </p>
          }
        </CardBody>
      </Card>
    )
  }
}
