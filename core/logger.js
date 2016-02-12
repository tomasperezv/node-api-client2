/*jslint browser: true*/
var winston = require('winston');

/**
 * The Logger object provides a layer on top of an error logger,
 * in order to decouple the application layer from a specific
 * logger implementation.
 *
 * I have set a rudimentary error log levels system, based on a
 * env variable (DEBUG), that we will check in runtime to determine
 * if we want to display messages or not depending on the level:
 *
 *  e.g.
 *  env DEBUG=2 node location.js => will run the location service in debug mode.
 *
 * @see https://github.com/winstonjs/winston
 */
var logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({colorize: true})
  ]
});

module.exports = {

  /**
   * @param {String} message
   * @method log
   * @public
   */
  log: function(message) {
    if (process.env.DEBUG && parseInt(process.env.DEBUG, 10) >= 2) {
      logger.log('info', message);
    }
  },

  /**
   * @param {String|Object} message
   * @method error
   * @public
   */
  error: function(message) {
    if (process.env.DEBUG && parseInt(process.env.DEBUG, 10) >= 1) {
      logger.log('error', message);
    }
  }

};
