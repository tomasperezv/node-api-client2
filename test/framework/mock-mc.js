/*jslint node: true */
'use strict';

/**
 * The memcache handler has an external dependency on the
 * mc module, we need to mock it using proxyquire to support
 * unit testing.
 *
 * @class mcStub
 */
var mcStub = {
  /**
   * @type {Array}
   */
  config: null,

  /**
   * Mocks the memcache key-value storage
   * @type {Object}
   */
  cache: {},

  /**
   * @type {Object}
   */
  Client: function(config) {
    mcStub.config = config;
  }
};

module.exports = mcStub;
