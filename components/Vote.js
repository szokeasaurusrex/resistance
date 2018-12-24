'use strict'

/* global confirm */

import React from 'react'
import { Card, CardTitle, CardBody, Button, Row, Col } from 'reactstrap'
import WaitingSection from './WaitingSection.js'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faFistRaised,
  faUserSecret,
  faThumbsUp,
  faThumbsDown } from '@fortawesome/free-solid-svg-icons'

export default class Vote extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      voted: false
    }
  }

  vote (votedYes) {
    if (this.props.voting.isProposal || votedYes || this.props.myPlayer.isSpy) {
      let vote
      if (this.props.voting.isProposal) {
        if (votedYes) {
          vote = 'UPVOTE'
        } else {
          vote = 'DOWNVOTE'
        }
      } else {
        if (votedYes) {
          vote = 'COMPLETE MISSION'
        } else {
          vote = 'SABOTAGE'
        }
      }
      if (confirm('Confirm vote: ' + vote)) {
        this.props.socketEmmitter('submitVote', votedYes)
        this.setState({
          voted: true
        })
      }
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.voting.voteId !== prevProps.voting.voteId) {
      this.setState({
        voted: false
      })
    }
  }

  render () {
    const { voting, socketEmmitter, children, myPlayer, ...rest } = this.props

    const buttonContent = {
      proposal: {
        yes: <span>Upvote <FontAwesomerIcon icon={faThumbsUp} /></span>,
        no: <span>Downvote <FontAwesomerIcon icon={faThumbsDown} /></span>
      },
      missionVote: {
        yes: (
          <span>
            Complete Mission <FontAwesomerIcon icon={faFistRaised} />
          </span>
        ),
        no: <span>Sabotage <FontAwesomerIcon icon={faUserSecret} /></span>
      }
    }

    return (
      <Card {...rest}>
        <CardBody>
          { (voting.isProposal || voting.missionList.includes(myPlayer.name)) &&
            !this.state.voted
            ? (
              <div>
                <CardTitle>Vote</CardTitle>
                { voting.isProposal ? 'Mission proposal:' : 'Mission:' }
                <br />
                <ul>
                  { voting.missionList.includes(myPlayer.name) &&
                    <li key={myPlayer.name}><strong>Me</strong></li>
                  }
                  { voting.missionList.map(player => (
                    player !== myPlayer.name &&
                    <li key={player}>{ player }</li>
                  ))}
                </ul>
                <hr />
                <Row>
                  <Col md='5'>
                    <Button color='danger' size='lg' block
                      onClick={event => this.vote(true)}>
                      { voting.isProposal
                        ? buttonContent.proposal.yes
                        : buttonContent.missionVote.yes
                      }
                    </Button>
                    <br />
                  </Col>
                  <Col md='2' />
                  <Col md='5'>
                    <Button color='dark' size='lg' block
                      onClick={event => this.vote(false)}>
                      { voting.isProposal
                        ? buttonContent.proposal.no
                        : buttonContent.missionVote.no
                      }
                    </Button>
                    <br />
                  </Col>
                </Row>
                <p className='small'>
                  Your vote is { voting.isProposal ? 'public' : 'private'}.
                </p>
              </div>
            )
            : (
              <WaitingSection>Waiting for votes...</WaitingSection>
            )
          }
        </CardBody>
      </Card>
    )
  }
}
