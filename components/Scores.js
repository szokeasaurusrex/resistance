'use strict'

import React from 'react'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faUserSecret, faFistRaised } from '@fortawesome/free-solid-svg-icons'

export default class Scores extends React.Component {
  render () {
    const { gameStatus, children, ...rest } = this.props
    const scores = gameStatus.scores
    const spyIcon = <FontAwesomerIcon icon={faUserSecret} />
    const resistanceIcon = <FontAwesomerIcon icon={faFistRaised} />
    return (
      <div {...rest}>
        <h1 className='display-4 text-center'>
          {(() => {
            switch (gameStatus.winner) {
              case 'spies':
                return (
                  <span className='spy'>
                    Spies win! { spyIcon }
                  </span>
                )
              case 'resistance':
                return (
                  <span className='resistance'>
                    Resistance wins! { resistanceIcon }
                  </span>
                )
              default:
                return (
                  <span>
                    <span className='resistance'>
                      { resistanceIcon } { scores.resistance }
                    </span>
                    {' - '}
                    <span className='spy'>
                      { scores.spies } { spyIcon }
                    </span>
                  </span>
                )
            }
          })()}

        </h1>
      </div>
    )
  }
}
