'use strict'

/* global fetch, sessionStorage, alert */

import React from 'react'
import Router from 'next/router'
import PageLayout from '../components/PageLayout.js'
import PageHeader from '../components/PageHeader.js'
import Home from '../components/Home.js'
import Create from '../components/Create.js'
import Join from '../components/Join.js'

export default class Index extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      header: 'Resistance',
      show: []
    }
    this.handleCreate = this.handleCreate.bind(this)
    this.handleJoin = this.handleJoin.bind(this)
    this.backToHome = this.backToHome.bind(this)
  }
  componentDidMount () {
    this.backToHome()
  }
  hidden (componentName) {
    return !this.state.show.includes(componentName)
  }
  handleCreate () {
    this.setState({
      show: ['create'],
      header: 'Create Game'
    })
  }
  handleJoin () {
    this.setState({
      show: ['join'],
      header: 'Join Game'
    })
  }
  async handleCreateJoinSubmit (event) {
    try {
      event.preventDefault()
      const form = event.target
      const data = { playerName: form.name.value }
      if (form.code && (form.code.value >= 1000000 || form.code.value < 0)) {
        throw new Error(
          'Game must be 6 digits or less, and cannot be negative.'
        )
      } else if (form.code) {
        data.gameCode = form.code.value
      }
      const response = await fetch('/join', {
        method: 'post',
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(data)
      })
      const responseData = await response.json()

      if (responseData.error) {
        throw responseData.error
      }
      sessionStorage.authKey = JSON.stringify(responseData)
      Router.push('/game')
    } catch (e) {
      alert('Error: ' + e.message)
      if (e.name !== 'UserException') {
        console.error(e)
      }
    }
  }
  backToHome () {
    this.setState({
      header: 'Resistance',
      show: ['home']
    })
  }
  render () {
    return (
      <PageLayout title='Resistance'>
        <PageHeader>
          <h1 className='display-4'>{ this.state.header }</h1>
        </PageHeader>
        <Home onClickCreate={this.handleCreate}
          onClickJoin={this.handleJoin}
          hidden={this.hidden('home')} />
        <Create onSubmit={this.handleCreateJoinSubmit}
          onClickBack={this.backToHome}
          hidden={this.hidden('create')} />
        <Join onSubmit={this.handleCreateJoinSubmit}
          onClickBack={this.backToHome}
          hidden={this.hidden('join')} />

        <style jsx>{`
          .hidden {
            display: none;
          }
        `}</style>
      </PageLayout>
    )
  }
}
