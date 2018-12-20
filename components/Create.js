'use strict'

/* global alert */

import React from 'react'
import Overlay from './Overlay.js'
import Spinner from './Spinner.js'
import { Form, FormGroup, Button, Input, Label, Row, Col } from 'reactstrap'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import ReCaptcha from 'react-google-recaptcha'

export default class Create extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      reCaptchaValue: ''
    }
    this.submit = this.submit.bind(this)
    this.onReCaptchaChange = this.onReCaptchaChange.bind(this)
  }
  onReCaptchaChange (value) {
    this.setState({
      reCaptchaValue: value
    })
  }
  async submit (event) {
    if (this.state.reCaptchaValue === '') {
      alert('You must complete the captcha before continuing')
    } else {
      this.setState({
        loading: true
      })
      if (!(await this.props.onSubmit(event, this.state.reCaptchaValue))) {
        this.setState({
          loading: false
        })
      }
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
          <FormGroup>
            <ReCaptcha
              sitekey={process.env.RECAPTCHA_SITE_KEY}
              onChange={this.onReCaptchaChange}
            />
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
              <Button color='primary' size='lg' block
                disabled={this.state.reCaptchaValue === ''}>
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
