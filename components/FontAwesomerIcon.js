'use strict'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class FontAwesomerIcon extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      icon: null
    }
  }
  componentDidMount () {
    this.setState({
      icon: <FontAwesomeIcon {...this.props} />
    })
  }
  render () {
    return (
      <span>
        { this.state.icon }
      </span>
    )
  }
}
