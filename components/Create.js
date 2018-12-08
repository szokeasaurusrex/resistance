'use strict'

import React from 'react'
import Overlay from '../components/Overlay.js'
import Spinner from '../components/Spinner.js'
import { Form, FormGroup, Button, Input, Label, Row, Col } from 'reactstrap'
import FontAwesomerIcon from '../components/FontAwesomerIcon.js'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default class Create extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.submit = this.submit.bind(this)
  }
  async submit (event) {
    this.setState({
      loading: true
    })
    if (!(await this.props.onSubmit(event))) {
      this.setState({
        loading: false
      })
    }
  }
  render () {
    const { children, onSubmit, onClickBack, ...rest } = this.props
    return (
      <div {...rest}>
        <Form {...rest} onSubmit={this.submit}>
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

        { this.state.loading &&
          <Overlay>
            <h6>Creating game...</h6>
            <br />
            <Spinner />
          </Overlay>
        }
      </div>
    )
  }
}
