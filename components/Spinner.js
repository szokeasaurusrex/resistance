'use strict'

import React from 'react'

export default class Spinner extends React.Component {
  render () {
    const {
      size = '100px',
      children,
      color = '#333333',
      centered = true,
      ...rest
    } = this.props

    const containerClasses = `spinner-container ${centered && 'centered'}`

    return (
      <div {...rest} className={containerClasses} >
        <div className='circle-0' />
        <div className='circle-1' />
        <style jsx>{`
          .spinner-container {
            width: ${size};
            height: ${size};
            position: relative;
          }
          .centered {
            margin: auto;
          }
          .circle-0, .circle-1 {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: ${color};
            animation: ripple 2.0s infinite ease-in-out;
          }
          .circle-1 {
            animation-delay: -1.0s;
          }
          @keyframes ripple {
            0% {
              transform: scale(0.0);
              opacity: 1.0
            }
            50% {
              transform: scale(1.0);
              opacity: 0.7;
            }
            100% {
              transform: scale(0.4);
              opacity: 0.0;
            }
          }
        `}</style>
      </div>
    )
  }
}
