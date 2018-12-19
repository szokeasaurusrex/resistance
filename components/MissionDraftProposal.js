'use strict'

import React from 'react'

export default class MissionDraftProposal extends React.Component {
  render () {
    const { myPlayer, draftProposal, children, ...rest } = this.props
    return (
      <div {...rest}>
        <h5>Draft Proposal</h5>
        <ul>
          { draftProposal.includes(myPlayer.name) &&
            <li><strong>Me</strong></li>
          }
          { draftProposal.map(playerName => (playerName !== myPlayer.name &&
            <li key={playerName}>{ playerName }</li>
          ))}
        </ul>
      </div>
    )
  }
}
