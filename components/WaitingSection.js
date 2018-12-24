'use strict'

import React from 'react'
import Spinner from './Spinner.js'

export default class WaitingSection extends React.Component {
  render () {
    const { children, ...rest } = this.props
    return (
      <div {...rest}>
        <Spinner />
        <br />
        <p className='lead text-center'>{ children }</p>
      </div>
    )
  }
}
