'use strict'

import React from 'react'
import { Form, FormGroup, Button, Input, Label, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default class Create extends React.Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.formRef = React.createRef()
  }
  handleSubmit(event) {
    event.preventDefault()
    this.props.onSubmit(this.formRef.current)
  }
  render() {
    const { children, onSubmit, onClickBack, ...rest } = this.props
    return (
      <Form { ...rest } onSubmit={ this.handleSubmit } ref={ this.formRef }>
        <FormGroup>
          <Label for='name'>Name:</Label>
          <Input type='text' name='name' id='name-input'
            placeholder='Enter your name' required />
        </FormGroup>
        <Row>
          <Col md='4'>
            <Button type='button' color='secondary' size='lg' block
              onClick={ onClickBack }>
              <FontAwesomeIcon icon={ faArrowLeft } /> Back
            </Button>
            <br />
          </Col>
          <Col md='4' />
          <Col md='4'>
            <Button color='primary' size='lg' block>
              Create game <FontAwesomeIcon icon={ faArrowRight } />
            </Button>
            <br />
          </Col>
        </Row>
      </Form>
    )
  }
}
