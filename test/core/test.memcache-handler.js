/*jslint node: true */
/*global describe, it */
'use strict';

var expect = require('expect.js');
var proxyquire = require('proxyquire');
var mcStub = require('../framework/mock-mc.js');

/**
 * Unit tests for the object MemcacheHandler
 * @see ../core/memcache-handler.js
 */
describe('Memcache handler', function(){

  /**
   * @type {String} TEST_KEY
   */
  var TEST_KEY = 'test-key';

  /**
   * @type {String} TEST_VALUE
   */
  var TEST_VALUE = 'test-value';

  /**
   * Loads the memcache handler overriding the module 'mc' with our
   * custom mock.
   * @method requireModule
   * @return {MemcacheHandler}
   */
  var requireModule = function() {
    return proxyquire('../../core/memcache-handler', { 'mc': mcStub });
  };

  describe('Creation and initialization', function() {

    it('Error event is triggered on failed connection', function(done) {
      mcStub.Client.prototype.connect = function(callback) {
        // Sending an error
        callback(true);
      };

      var memcacheHandler = requireModule();
      memcacheHandler.on('error', function() {
        done();
      });

      memcacheHandler.on('connect', function() {
        done(new Error('Connect event emitted with a wrong connection setup.'));
      });
    });

    it('Connect event is triggered', function(done) {
      mcStub.Client.prototype.connect = function(callback) {
        callback();
      };

      var memcacheHandler = requireModule();
      memcacheHandler.on('error', function() {
        done(new Error('Error event emitted with a valid connection setup.'));
      });

      memcacheHandler.on('connect', function() {
        done();
      });
    });


    it('The handler initializes properly the configuration', function(done) {
      var memcacheHandler = requireModule();

      memcacheHandler.on('connect', function() {
        if (mcStub.config === null) {
          done(mcStub.Client.config === null);
        } else {
          done();
        }
      });
    });

  });

  describe('Get and Set Memcache keys', function() {

    it('Get a key that is in the cache', function(done) {

      mcStub.Client.prototype.get = function(key, callback) {
        callback(false, TEST_VALUE);
      };

      var memcacheHandler = requireModule();

      memcacheHandler.get(TEST_KEY)
      .then(function(data) {
        done();
      })
      .catch(function() {
        done(new Error('Failure retrieving value from cache.'));
      });

    });

    it('Trying to get a key that is not in the cache', function(done) {

      mcStub.Client.prototype.get = function(key, callback) {
        callback(true);
      };

      var memcacheHandler = requireModule();

      memcacheHandler.get(TEST_KEY)
      .then(function(data) {
        done(new Error('Returning a key that is not in cache.'));
      })
      .catch(function() {
        done();
      });

    });

    it('Default TTL for keys set', function(done) {

      mcStub.Client.prototype.set = function(key, value, TTL, callback) {
        mcStub.TTL = TTL;
        callback(false);
      };

      var memcacheHandler = requireModule();

      memcacheHandler.set(TEST_KEY, TEST_VALUE)
      .then(function(data) {
        if (mcStub.TTL.exptime === memcacheHandler.DEFAULT_TTL) {
          done();
        } else {
          done(new Error('Custom TTL has not been set.'));
        }
      });

    });

    it('Set a key with a custom TTL', function(done) {

      mcStub.Client.prototype.set = function(key, value, TTL, callback) {
        mcStub.TTL = TTL;
        callback(false);
      };

      var memcacheHandler = requireModule();

      memcacheHandler.set(TEST_KEY, TEST_VALUE, 300)
      .then(function(data, TTL) {
        if (mcStub.TTL.exptime === 300) {
          done();
        } else {
          done(new Error('Custom TTL has not been set.'));
        }
      });

    });


    it('Set and get a key', function(done) {

      mcStub.Client.prototype.get = function(key, callback) {
        callback(false, mcStub.cache);
      };

      mcStub.Client.prototype.set = function(key, value, TTL, callback) {
        mcStub.cache[key] = value;
        callback(false);
      };

      var memcacheHandler = requireModule();

      memcacheHandler.set(TEST_KEY, TEST_VALUE)
      .then(function(data) {
        memcacheHandler.get(TEST_KEY)
        .then(function(data) {
          if (data === TEST_VALUE) {
            done();
          } else {
            done(new Error('We couldn\'t set and fetch a key.'));
          }
        });
      });

    });

  });

});
