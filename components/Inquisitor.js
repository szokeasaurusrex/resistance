'use strict'

/* global alert */

import React from 'react'
import {
  Card,
  CardBody,
  CardTitle,
  Alert,
  Form,
  FormGroup,
  CustomInput,
  Row,
  Col,
  Button,
  Label } from 'reactstrap'
import WaitingSection from './WaitingSection.js'
import { faFistRaised, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import FontAwesomerIcon from './FontAwesomerIcon.js'

export default class Inquisitor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      responseVisible: false,
      inspectedVisible: false,
      checkedName: ''
    }
    this.handleSelect = this.handleSelect.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.hideResponse = this.hideResponse.bind(this)
    this.hideInspected = this.hideInspected.bind(this)
  }
  componentDidUpdate (prevProps) {
    const { inquisitor, inquisitorResponse, myPlayer } = this.props
    if (Object.keys(inquisitorResponse).length > 0 &&
      Object.keys(prevProps.inquisitorResponse).length === 0) {
      this.setState({
        responseVisible: true
      })
    } else if (
      inquisitor.previous.length !== prevProps.inquisitor.previous.length &&
      inquisitor.previous[inquisitor.previous.length - 1] !== myPlayer.name
    ) {
      this.setState({
        inspectedVisible: true
      })
    }
  }
  hideResponse () {
    this.setState({
      responseVisible: false
    })
  }
  hideInspected () {
    this.setState({
      inspectedVisible: false
    })
  }
  handleSelect (playerName) {
    this.setState({
      checkedName: playerName
    })
  }
  handleSubmit (event) {
    event.preventDefault()
    if (this.state.checkedName === '') {
      alert('You must select a player before continuing.')
    } else {
      this.props.socketEmmitter(
        'inquisitorInspect', this.state.checkedName, 'Inspecting player'
      )
    }
  }
  render () {
    const {
      inquisitor,
      inquisitorResponse,
      players,
      myPlayer,
      children,
      socketEmmitter,
      ...rest
    } = this.props
    return (
      <div {...rest}>
        { inquisitor.waiting && inquisitor.current !== myPlayer.name &&
          <Card>
            <CardBody>
              <WaitingSection>Waiting for inquisitor...</WaitingSection>
            </CardBody>
          </Card>
        }
        { inquisitor.waiting && inquisitor.current === myPlayer.name &&
          <Card>
            <CardBody>
              <CardTitle>Inspect Player</CardTitle>
              <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Label for='playerToInspect'>
                    Choose a player to reveal their team:
                  </Label>
                  <div>
                    { players.map(player => {
                      if (player.name !== myPlayer.name &&
                        !inquisitor.previous.some(
                          name => name === player.name
                        )) {
                        return (
                          <CustomInput key={player.name} type='radio'
                            label={player.name}
                            id={`inspect-player-${player.name}`}
                            onChange={() => this.handleSelect(player.name)}
                            checked={this.state.checkedName === player.name}
                          />
                        )
                      }
                    }) }
                  </div>
                </FormGroup>
                <Row>
                  <Col md='3' />
                  <Col md='6'>
                    <Button color='success' size='lg' block
                      disabled={this.state.checkedName === ''}>
                      Inspect identity
                    </Button>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        }
        { this.state.responseVisible &&
          <Alert color='success' toggle={this.hideResponse}>
            <p className='lead'>
              { inquisitorResponse.name } is {
                inquisitorResponse.team === 'spies'
                  ? (
                    <span>
                      a <strong>Spy </strong>
                      <FontAwesomerIcon icon={faUserSecret} />
                    </span>
                  )
                  : (
                    <span>
                      on the <strong>Resistance </strong>
                      <FontAwesomerIcon icon={faFistRaised} />
                    </span>
                  )
              }
            </p>
          </Alert>
        }
        { this.state.inspectedVisible &&
          <Alert color='success' toggle={this.hideInspected}>
            {inquisitor.previous[inquisitor.previous.length - 1]} inspected
            {' '}{inquisitor.current === myPlayer.name
              ? <strong>my</strong>
              : inquisitor.current + "'s"
            } identity.
          </Alert>
        }
      </div>
    )
  }
}
