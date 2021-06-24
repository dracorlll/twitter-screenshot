const winston = require('winston');

module.exports = () => {
  winston.add(new winston.transports.File({ filename: 'error.log' }))
  winston.add(new winston.transports.Console(
    {
      format: winston.format.combine(
        winston.format.colorize({all: true}),
        winston.format.simple()
      )
    }))
}