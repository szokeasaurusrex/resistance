'use strict'

import React from 'react'
import { Row, Col, Button } from 'reactstrap'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faPlus, faSignInAlt } from '@fortawesome/free-solid-svg-icons'

export default class Home extends React.Component {
  render () {
    const { children, onClickCreate, onClickJoin, ...rest } = this.props
    return (
      <Row {...rest}>
        <Col md='1' />
        <Col md='4'>
          <Button color='primary' size='lg' block onClick={onClickCreate}>
            <FontAwesomerIcon icon={faPlus} /> Create game
          </Button>
          <br />
        </Col>
        <Col md='2' />
        <Col md='4'>
          <Button color='secondary' size='lg' block onClick={onClickJoin}>
            <FontAwesomerIcon icon={faSignInAlt} /> Join game
          </Button>
          <br />
        </Col>
      </Row>
    )
  }
}
