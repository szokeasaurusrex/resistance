'use strict'

import React from 'react'
import { Container, Row, Col } from 'reactstrap'

export default class Overlay extends React.Component {
  render () {
    const { children, ...rest } = this.props
    return (
      <div {...rest} className='overlay-background'>
        <div className='overlay-content'>
          { children }
        </div>
        <style jsx>{`
          .overlay-background {
            background-color: rgba(51, 51, 51, 0.7);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
          }
          .overlay-content {
            position: absolute;
            text-align: center;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            background-color: #ffffff;
            padding: 2em 4em;
            border-radius: 5px;
          }
        `}</style>
      </div>
    )
  }
}
