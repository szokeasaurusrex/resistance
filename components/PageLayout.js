'use strict'

import React from 'react'
import Head from 'next/head'
import { Container } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

export default class PageLayout extends React.Component {
  render () {
    const { title, children, ...rest } = this.props
    return (
      <div {...rest}>
        <Head>
          <title>{title}</title>
          <meta name='viewport'
            content='width=device-width, initial-scale=1, shrink-to-fit=no' />
        </Head>
        <Container>
          { children }
        </Container>
        <style jsx global>{`
          body {
            margin-top: 2em;
            color: #333333;
          }
        `}</style>
      </div>
    )
  }
}
