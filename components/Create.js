'use strict'

import React from 'react'
import { Form, FormGroup, Button, Input, Label, Row, Col } from 'reactstrap'
import FontAwesomerIcon from '../components/FontAwesomerIcon.js'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default class Create extends React.Component {
  constructor (props) {
    super(props)
    this.formRef = React.createRef()
  }
  render () {
    const { children, onSubmit, onClickBack, ...rest } = this.props
    return (
      <Form {...rest} onSubmit={onSubmit} ref={this.formRef}>
        <FormGroup>
          <Label for='name'>Name:</Label>
          <Input type='text' name='name' id='name-input'
            placeholder='Enter your name' required />
        </FormGroup>
        <Row>
          <Col md='4'>
            <Button type='button' color='secondary' size='lg' block
              onClick={onClickBack}>
              <FontAwesomerIcon icon={faArrowLeft} /> Back
            </Button>
            <br />
          </Col>
          <Col md='4' />
          <Col md='4'>
            <Button color='primary' size='lg' block>
              Create game <FontAwesomerIcon icon={faArrowRight} />
            </Button>
            <br />
          </Col>
        </Row>
      </Form>
    )
  }
}
