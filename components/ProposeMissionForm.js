'use stict'

import React from 'react'
import {
  CustomInput,
  Form,
  FormGroup,
  Label,
  Row,
  Col,
  Button } from 'reactstrap'

export default class ProposeMissionForm extends React.Component {
  constructor (props) {
    super(props)
    this.submit = this.submit.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.state = {
      checked: []
    }
  }
  submit (event) {
    event.preventDefault()
    this.props.socketEmmitter('finalProposal', this.state.checked)
  }
  handleInput (playerName) {
    let checked = this.state.checked
    let index = checked.indexOf(playerName)
    if (index > -1) {
      checked.splice(index, 1)
    } else {
      checked.push(playerName)
    }
    this.setState({
      checked: checked
    })
    this.props.socketEmmitter('draftProposal', checked)
  }
  render () {
    const {
      players,
      socketEmmitter,
      myPlayer,
      children,
      missionSize,
      ...rest
    } = this.props
    return (
      <Form {...rest} onSubmit={this.submit} id='proposeForm'>
        <h5>Propose Mission</h5>
        <FormGroup>
          <Label for='draftMissionList'>Select players:</Label>
          <div>
            <CustomInput type='checkbox' label={<strong>Me</strong>}
              id='myPlayerProposeCheckbox'
              onChange={() => this.handleInput(myPlayer.name)}
              checked={this.state.checked.includes(myPlayer.name)}
            />
            { players.map(player => (player.name !== myPlayer.name &&
              <CustomInput type='checkbox' label={player.name} key={player.name}
                id={player.name + 'ProposeCheckbox'}
                onChange={() => this.handleInput(player.name)}
                checked={this.state.checked.includes(player.name)}
              />
            )) }
          </div>
        </FormGroup>
        <Row>
          <Col md='4' />
          <Col md='4'>
            <Button color='success' onClick={this.submit} size='lg' block
              disabled={this.state.checked.length !== missionSize}>
              Propose Mission
            </Button>
          </Col>
        </Row>
      </Form>
    )
  }
}
