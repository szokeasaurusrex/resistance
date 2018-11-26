'use strict'

import React from 'react'
import { Row, Col, Button } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { children, onClickCreate, onClickJoin, ...rest } = this.props
    return (
      <Row { ...rest }>
        <Col md='1'></Col>
        <Col md='4'>
          <Button color='primary' size='lg' block onClick={ onClickCreate }>
            <FontAwesomeIcon icon={ faPlus } /> Create game
          </Button>
          <br />
        </Col>
        <Col md='2'></Col>
        <Col md='4'>
          <Button color='secondary' size='lg' block onClick={ onClickJoin }>
            <FontAwesomeIcon icon={ faSignInAlt } /> Join game
          </Button>
          <br />
        </Col>
      </Row>
    )
  }
}
