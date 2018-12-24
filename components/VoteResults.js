'use strict'

import React from 'react'
import { Alert, Row, Col } from 'reactstrap'
import FontAwesomerIcon from './FontAwesomerIcon.js'
import { faFistRaised, faUserSecret } from '@fortawesome/free-solid-svg-icons'

export default class VoteResults extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      proposalVisible: true,
      missionVisible: true
    }
    this.dismissProposal = this.dismissProposal.bind(this)
    this.dismissMission = this.dismissMission.bind(this)
  }

  dismissProposal () {
    this.setState({
      proposalVisible: false
    })
  }

  dismissMission () {
    this.setState({
      missionVisible: false
    })
  }

  componentDidUpdate (prevProps) {
    const prevResults = prevProps.voteResults
    const newResults = this.props.voteResults
    const newResultsContainProposal = (
      newResults != null && newResults.proposal != null
    )
    const proposalResultsChanged = (
      newResultsContainProposal && (
        prevResults == null ||
        prevResults.proposal == null ||
        prevResults.proposal.voteId !== newResults.proposal.voteId
      )
    )
    const newResultsContainMission = (
      newResults != null && newResults.mission != null
    )
    const missionResultsChanged = (
      newResultsContainMission && (
        prevResults == null ||
        prevResults.mission == null ||
        prevResults.mission.voteId !== newResults.mission.voteId
      )
    )
    if (proposalResultsChanged) {
      this.setState({
        proposalVisible: true
      })
    }
    if (missionResultsChanged) {
      this.setState({
        missionVisible: true
      })
    }
  }

  render () {
    const {
      voteResults: { proposal, mission },
      myPlayer,
      children,
      ...rest
    } = this.props
    return (
      <div {...rest}>
        { proposal &&
          <Alert color={proposal.passed ? 'danger' : 'dark'}
            isOpen={this.state.proposalVisible} toggle={this.dismissProposal}>
            <p className='lead'>
              Proposal { proposal.passed
                ? `passes ${proposal.tally.yes}-${proposal.tally.no}.`
                : `fails ${proposal.tally.no}-${proposal.tally.yes}.`
              }
            </p>
            <p>
              Mission list: { proposal.missionList.map((name, index) => (
                <span key={name}>
                  {name === myPlayer.name ? <strong>Me</strong> : name}
                  {index !== proposal.missionList.length - 1 && ', '}
                </span>
              ))}
            </p>
            { proposal.tally.yes !== 0 && proposal.tally.no !== 0 &&
              <Row>
                <Col xs='auto' md='6'>
                  <h6>Voted yes:</h6>
                  <ul>
                    { proposal.votes.map(vote => (
                      vote.vote === true &&
                      <li key={vote.name}>
                        { vote.name === myPlayer.name
                          ? <strong>Me</strong>
                          : vote.name
                        }
                      </li>
                    ))}
                  </ul>
                </Col>
                <Col xs='auto' md='6'>
                  <h6>Voted no:</h6>
                  <ul>
                    { proposal.votes.map(vote => (
                      vote.vote === false &&
                      <li key={vote.name}>
                        { vote.name === myPlayer.name
                          ? <strong>Me</strong>
                          : vote.name
                        }
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>
            }
          </Alert>
        }
        { mission &&
          <Alert color={mission.passed ? 'danger' : 'dark'}
            isOpen={this.state.missionVisible} toggle={this.dismissMission}>
            <p className='lead'>
              Mission #{mission.missionNumber + 1} { mission.passed
                ? (
                  <span>
                    accomplished! <FontAwesomerIcon icon={faFistRaised} />
                  </span>
                )
                : (
                  <span>
                    failed. <FontAwesomerIcon icon={faUserSecret} />
                  </span>
                )
              }
            </p>
            <p>
              Mission list: { mission.missionList.map((name, index) => (
                <span key='name'>
                  {name === myPlayer.name ? <strong>Me</strong> : name}
                  {index !== mission.missionList.length - 1 && ', '}
                </span>
              ))}
            </p>
            { mission.tally.no > 0 &&
              <p>
                {mission.tally.no} {
                  mission.tally.no === 1 ? 'spy' : 'spies'
                } sabotaged this mission.
              </p>
            }
          </Alert>
        }
      </div>
    )
  }
}
