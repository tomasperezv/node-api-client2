/*jslint node: true */
'use strict';

var mc = require('mc');
var exception = require('./exception/exception');

/**
 * The Memcache handler provides a layer on top of the memcache
 * module, in charge of implementing the connection to the servers and
 * providing promises for accessing to the set and get methods.
 *
 * @class MemcacheHandler
 * @constructor
 * @tests ../test/core/test.memcache-handler.js
 */
var MemcacheHandler = function(config) {
  /**
   * @type {Object} _config
   * @private
   */
  this._config = config;

  /**
   * Default value for the memcache keys set without specifying a TTL.
   * @type {Number} DEFAULT_TTL
   * @public
   */
  this.DEFAULT_TTL = 3600;

  /**
   * Maximum length for a key
   * @type {Number} MAX_KEY_LENGTH
   * @public
   */
  this.MAX_KEY_LENGTH = 250;

  /**
   * @type {MemcacheClient} _client
   * @private
   * @see http://overclocked.com/mc/
   */
  this._client = new mc.Client(this._config.instances);

  // On initilization we connect to the mc servers.
  var self = this;
  this._connect().then(function() {
    self.emit('connect');
  }).catch(function(e) {
    self.emit('error');
  });

};

// Extend MemcacheHandler to inherit EventEmitter interface
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(MemcacheHandler, EventEmitter);

/**
 * @method _connect
 * @return {Promise}
 * @private
 */
MemcacheHandler.prototype._connect = function() {
  var self = this;
  var promise = new Promise(function(resolve, reject) {
    self._client.connect(function(err) {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });

  return promise;
};

/**
 * Get a key from memcache.
 *
 * @param {String} key
 * @method get
 * @public
 * @return {Promise}
 */
MemcacheHandler.prototype.get = function(key) {
  var self = this;
  var promise = new Promise(function(resolve, reject) {
    self._client.get(key, function(err, data) {
      if (!err) {
        resolve(data[key]);
      } else {
        reject();
      }
    });
  });

  return promise;
};

/**
 * Set a key from memcache.
 * We delegate to the application layer the responsibility of filtering
 * the key (e.g. see core/api/api-client.js).
 *
 * @param {String} key
 * @param {String} value
 * @param {Number} TTL [Optional]
 * @method set
 * @public
 * @return {Promise}
 */
MemcacheHandler.prototype.set = function(key, value, TTL) {

  if (key.length > this.MAX_KEY_LENGTH) {
    // We might, however truncate the key as probably the driver internally does.
    // But that might hide tricky application bugs, that way if it happens we will
    // identify it easily.
    throw new exception.InvalidMemcacheKey('Trying to set a key with an invalid length: ' + key.length);
  }

  if (typeof TTL === 'undefined') {
    TTL = this.DEFAULT_TTL;
  }

  var self = this;
  var promise = new Promise(function(resolve, reject) {

    self._client.set(key, value, {exptime: TTL}, function(err, data) {
      if (!err) {
        // It sometimes would be useful to return the value we just
        // set but we are not doing it since it's not required for the
        // context of our basic layer of services.
        resolve(value);
      } else {
        reject(err);
      }
    });
  });

  return promise;
};

// There is only instance of the Memcache handler per application.
module.exports = function(config) {
  return new MemcacheHandler(config);
};
