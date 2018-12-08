'use strict'

class UserException extends Error {
  constructor (message, type) {
    super(message)
    this.message = message
    this.name = 'UserException'
    this.type = type || ''
  }
  toString () {
    return `Error: ${this.message}`
  }
  toJSON () {
    return {
      name: this.name,
      message: this.message,
      type: this.type
    }
  }
}

module.exports = UserException
