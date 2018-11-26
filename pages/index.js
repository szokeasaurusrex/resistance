'use strict'

import React from 'react'
import { Row, Col, Button } from 'reactstrap'
import PageLayout from '../components/PageLayout.js'
import PageHeader from '../components/PageHeader.js'
import Home from '../components/Home.js'
import Create from '../components/Create.js'
import Join from '../components/Join.js'

export default class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      header: 'Resistance',
      show: []
    }
    this.handleCreate = this.handleCreate.bind(this)
    this.handleJoin = this.handleJoin.bind(this)
    this.handleCreateSubmit = this.handleCreateSubmit.bind(this)
    this.backToHome = this.backToHome.bind(this)
  }
  componentDidMount() {
    this.backToHome()
  }
  hidden(componentName) {
    return !this.state.show.includes(componentName)
  }
  handleCreate() {
    this.setState({
      show: ['create'],
      header: 'Create Game'
    })
  }
  handleJoin() {
    this.setState({
      show: ['join'],
      header: 'Join Game'
    })
  }
  handleCreateSubmit(object) {
    console.log(object)
  }
  handleJoinSubmit(event) {
    event.preventDefault()
    alert('Game joined!')
  }
  backToHome() {
    this.setState({
      header: 'Resistance',
      show: ['home']
    })
  }
  render() {
    return (
      <PageLayout title='Resistance'>
        <PageHeader>{ this.state.header }</PageHeader>
        <Home onClickCreate={ this.handleCreate }
          onClickJoin={ this.handleJoin }
          hidden={ this.hidden('home') } />
        <Create onSubmit={ this.handleCreateSubmit }
          onClickBack={ this.backToHome }
          hidden={ this.hidden('create')} />
        <Join onSubmit={ this.handleJoinSubmit }
          onClickBack={ this.backToHome }
          hidden={ this.hidden('join') } />

        <style jsx>{`
          .hidden {
            display: none;
          }
        `}</style>
      </PageLayout>
    )
  }
}
