'use strict'

import React from 'react'

export default class PageHeader extends React.Component {
  render () {
    const { children, centering = true, ...rest } = this.props
    return (
      <div {...rest} className={centering && 'text-center'}>
        { children }<hr /><br />
      </div>
    )
  }
}
