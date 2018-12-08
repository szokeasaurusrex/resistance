'use strict'

import React from 'react'

export default class PageHeader extends React.Component {
  render () {
    const { children, ...rest } = this.props
    return (
      <div {...rest} className='text-center'>
        { children }<hr /><br />
        <style jsx>{`
          h1 {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }
}
