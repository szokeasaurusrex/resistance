'use strict'

import React from 'react'
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Row,
  Col } from 'reactstrap'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faFistRaised, faUserSecret } from '@fortawesome/free-solid-svg-icons'

export default class TeamInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showing: true
    }
    this.toggle = this.toggle.bind(this)
  }
  toggle () {
    this.setState({
      showing: !this.state.showing
    })
  }
  render () {
    const { myPlayer, canHideTeam, gameStatus, ...rest } = this.props
    return (
      <Card {...rest}>
        <CardBody>
          { (this.state.showing || !canHideTeam) &&
            <div>
              <CardTitle>
                { myPlayer.isSpy
                  ? (
                    <p className='lead'>
                      You are a <span className='spy'>
                        Spy <FontAwesomerIcon icon={faUserSecret} />
                      </span>
                    </p>
                  )
                  : (
                    <p className='lead'>
                      You are in the <span className='resistance'>
                        Resistance <FontAwesomerIcon icon={faFistRaised} />
                      </span>
                    </p>
                  )
                }
              </CardTitle>
              { myPlayer.isSpy &&
                <div>
                  { gameStatus.spies.length > 2
                    ? 'The other spies are:' : 'The other spy is:'}
                  <ul>
                    { gameStatus.spies.map(name => (
                      name !== myPlayer.name && <li key={name}>{ name }</li>
                    )) }
                  </ul>
                </div>
              }
            </div>
          }

          <Row>
            <Col md='4' />
            <Col md='4'>
              <Button color='secondary' onClick={this.toggle} outline
                disabled={!canHideTeam} block>
                { this.state.showing ? 'Hide' : 'Show' } player info
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }
}
