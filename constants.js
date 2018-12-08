'use strict'

exports.GAME_CODE_LENGTH = 6
exports.MONGO_URL = 'mongodb://localhost:27017'
exports.GAME_TTL = process.env.NODE_ENV === 'production' ? 86400000 : 1800000
