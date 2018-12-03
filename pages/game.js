'use strict'

import React from 'react'
import PageLayout from '../components/PageLayout.js'
import PageHeader from '../components/PageHeader.js'
import io from 'socket.io-client'

export default class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      header: <h1 className='display-4'>Waiting for players</h1>,
      show: [],
      gameInProgress: false,
      gameCode: ''
    }
  }
  componentDidMount() {
    const socket = io(`${location.protocol}//${location.host}`)
  }
  render() {
    return (
      <PageLayout title='Resistance'>
        <PageHeader>{ this.state.header }</PageHeader>
        <div hidden={ this.state.gameInProgress }>
          <p class='lead'>Game code: { this.state.gameCode }</p>
        </div>
      </PageLayout>
    )
  }
}
