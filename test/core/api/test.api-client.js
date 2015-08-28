/*jslint node: true */
/*global describe, it */
'use strict';

var expect = require('expect.js');
var proxyquire = require('proxyquire');
var ApiClient = require('../../../core/api/api-client');
var exception = require('../../../core/exception/exception');

/**
 * Unit tests for the ApiClient
 * @see ../../core/api/api-client.js
 */
describe('ApiClient', function(){

  /**
   * Used to generate the memcache keys
   * @type {String} VERSION
   */
  var VERSION = '5';

  describe('Memcache keys filtering', function() {

    it('Composing keys', function() {
      var apiClient = new ApiClient();
      expect(apiClient._getMCKey('test', VERSION)).to.eql('test_' + VERSION);
      expect(apiClient._getMCKey('test')).to.eql('test_');

      expect(function() {
        apiClient._getMCKey();
      }).to.throwException(function(e) {
        expect(e).to.be.an(exception.InvalidMemcacheKey);
      });

    });

    it('Filtering keys', function() {

      var apiClient = new ApiClient();

      // Maps key values with what we expect to be the result
      var filterMapping = {
        'this is an invalid    key  ': 'thisisaninvalidkey_' + VERSION,
        'some characters πρςστυφχψω': 'somecharacters_' + VERSION
      };

      for (var key in filterMapping) {
        var expectation = filterMapping[key];
        var result = apiClient._getMCKey(key, VERSION);
        expect(result).to.eql(expectation);
      }

    });

  });

  describe('Generating API URL\'s', function() {

    it('Get URL works as expected', function() {
      var apiClient = new ApiClient();
    });

  });

});
