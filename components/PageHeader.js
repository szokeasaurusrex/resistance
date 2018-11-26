'use strict'

import React from 'react'

export default class PageHeader extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { children, ...rest } = this.props
    return (
      <div { ...rest } className='text-center'>
        <h1 className='display-4'>{ children }</h1><hr /><br />
        <style jsx>{`
          h1 {
            text-align: center;
          }
        `}</style>
      </div>
    )
  }
}
