'use strict'

/* global sessionStorage, alert */

import React from 'react'
import PageLayout from '../components/PageLayout.js'
import PageHeader from '../components/PageHeader.js'
import Overlay from '../components/Overlay.js'
import Spinner from '../components/Spinner.js'
import io from 'socket.io-client'
import Router from 'next/router'
import PlayerLobby from '../components/PlayerLobby.js'
import GameInProgress from '../components/GameInProgress.js'

export default class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      header: <h1 className='display-4'>Waiting for players</h1>,
      show: [],
      gameInProgress: false,
      gameCode: '',
      gameStatus: {},
      loadMessage: '',
      draftProposal: [],
      player: {},
      canHideTeam: true
    }
    this.socketEmmitter = this.socketEmmitter.bind(this)
  }
  handleUnload (e) {
    e.preventDefault()
    e.returnValue = ''
  }
  socketEmmitter (event, message, loadMessage) {
    this.socket.emit(event, message)
    if (loadMessage) {
      this.setState({
        loadMessage: loadMessage + '...'
      })
    }
  }
  componentDidMount () {
    const noTeamHidingTime = 3000
    if (sessionStorage.authKey) {
      const player = JSON.parse(sessionStorage.authKey)
      this.setState({
        player: player,
        gameCode: player.gameCode
      })

      this.socket = io()

      this.socket.on('connect', () => {
        this.socket.emit('authRequest', this.state.player)
      })

      this.socket.on('disconnect', () => {
        this.setState({
          loadMessage: 'Offline. Attemting to reconnect...'
        })
      })

      this.socket.on('myError', error => {
        console.error(error)
        this.setState({
          loadMessage: ''
        })
        alert(error.message)
        if (error.type === 'authError') {
          sessionStorage.removeItem('authKey')
          Router.push('/')
        }
      })

      this.socket.on('draftProposal', playerList => {
        this.setState({
          draftProposal: playerList
        })
      })

      this.socket.on('gameStatus', status => {
        if (status.playing) {
          console.log(status.spies)
          this.setState(prevState => ({
            gameInProgress: true,
            gameStatus: status,
            draftProposal: [],
            player: {
              ...prevState.player,
              isSpy: (status.spies != null)
            }
          }))
        } else {
          this.setState({
            gameStatus: status,
            gameInProgress: false
          })
        }
      })

      this.socket.on('gameStarted', () => {
        this.setState({ canHideTeam: false })
        setTimeout(() => {
          this.setState({ canHideTeam: true })
        }, noTeamHidingTime)
      })

      this.socket.on('loading', loadMessage => {
        this.setState({
          loadMessage: loadMessage + '...'
        })
      })

      this.socket.on('actionCompleted', () => this.setState({
        loadMessage: ''
      }))

      this.socket.on('nameChanged', msg => {
        this.setState(prevState => ({
          player: {
            ...prevState.player,
            name: msg.newName
          }
        }))
        sessionStorage.authKey = JSON.stringify(this.state.player)
      })

      this.socket.on('kicked', () => {
        sessionStorage.removeItem('authKey')
        Router.push('/')
      })

      window.addEventListener('beforeunload', this.handleUnload)
    } else {
      Router.push('/')
    }
  }
  componentWillUnmount () {
    if (this.socket) {
      this.socket.disconnect()
      delete this.socket
    }
    window.removeEventListener('beforeunload', this.handleUnload)
  }
  render () {
    return (
      <PageLayout title='Resistance'>
        { !this.state.gameInProgress
          ? (
            <div>
              <PageHeader>{this.state.header}</PageHeader>
              <PlayerLobby
                gameCode={this.state.gameCode}
                players={this.state.gameStatus.players || []}
                myPlayer={this.state.player}
                socketEmmitter={this.socketEmmitter}
              />
            </div>
          )
          : (
            <GameInProgress
              gameStatus={this.state.gameStatus}
              canHideTeam={this.state.canHideTeam}
              myPlayer={this.state.player}
              socketEmmitter={this.socketEmmitter}
              draftProposal={this.state.draftProposal}
            />
          )
        }

        { this.state.loadMessage !== '' &&
          <Overlay>
            <h6>{ this.state.loadMessage }</h6>
            <br />
            <Spinner />
          </Overlay>
        }

      </PageLayout>
    )
  }
}
