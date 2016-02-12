/*jslint node: true */
'use strict';

var exception = require('../exception/exception.js');
var http = require('http');

/**
 * Base object used to create clients of different external HTTP API's,
 * encapsulating the common functionality required, for performing requests,
 * filtering and parsing.
 *
 * @class ApiClient
 * @constructor
 * @tests ../test/core/api/test.api-client.js
 */
var ApiClient = function() {
  /**
   * @type {Object} _config
   * @private
   */
  this._config = {};

  /**
   * @type {String} _clientId
   * @private
   */
  this._clientId = 'default';

  /**
   * @type {Object} _config
   * @private
   */
  this._defaultParameters = {
    key: '',
    lang: 'en'
  };

  /**
   * Used by the children objects to define the base url.
   * @type {String} baseUrl
   */
  this._baseUrl = '';

  /**
   * @type {Object} _headers
   */
  this._headers = {
  };

  /**
   * Used by the cache layer, it can
   * be overriden by child objects.
   *
   * @type {Object} DEFAULT_TTL
   */
  this.DEFAULT_TTL = 300;
};

/**
 * Includes HTTP Basic Authentication schema
 *
 * @param {String} username
 * @param {String} password
 * @method _setBasicAuth
 * @private
 * @see https://en.wikipedia.org/wiki/Basic_access_authentication
 */
ApiClient.prototype._setBasicAuth = function(username, password) {
  this._headers['Authorization'] = 'Basic ' + new Buffer(username + password).toString('base64');
};

/**
 * @param {Object} parameters
 * @return {String}
 * @method _getUrl
 * @private
 */
ApiClient.prototype._getUrl = function(parameters) {

  var params = [];
  var addParams = function(paramsMap) {
    for (var paramKey in paramsMap) {
      if (paramsMap.hasOwnProperty(paramKey)) {
        params.push(encodeURIComponent(paramKey) + '=' + encodeURIComponent(paramsMap[paramKey]));
      }
    }
  };

  addParams(this._defaultParameters);
  addParams(parameters);

  return this._baseUrl + '?' + params.join('&');
};

/**
 * Filters a memcache key composed by a prefix and postfix.
 * The postfix can be used as a way of versioning.
 *
 * @param {String} prefix
 * @param {String} postfix [Optional]
 * @return {String}
 * @method _getMCKey
 * @private
 */
ApiClient.prototype._getMCKey = function(prefix, postfix) {

  if (typeof prefix !== 'string' || prefix === '') {
    throw new exception.InvalidMemcacheKey('The ApiClient tried to set an empty memcache key.');
  }

  if (typeof postfix === 'undefined') {
    postfix = '';
  }

  var key = prefix + '_' + postfix;
  return key.replace(/[^a-z0-9_]/gi,'');
};

/**
 * Performs a HTTP GET request to a service, with support for caching the result.
 *
 * @method GET
 * @param {Object} parameters
 * @param {String} cacheKey
 * @param {Function} onComplete
 * @param {Boolean} useHTTPS [Optional] Enables requests via https
 */
ApiClient.prototype.GET = function(parameters, cacheKey, onComplete, useHTTPS) {

  var self = this;
  MemcacheHandler.get(cacheKey).then(function(data) {
    onComplete(false, JSON.parse(data));
  }).catch(function() {

    var requestInterface = http;
    if (typeof useHTTPS !== 'undefined' && useHTTPS === true) {
      var https = require('https');
      requestInterface = https;
    }

    var options = {
      host: self._baseUrl,
      path: '?' + params.join('&'),
      headers: self._headers
    };

    requestInterface.request(options, function(response) {
      self._readResponse(response, cacheKey, onComplete);
    }).end();

  });

};

/**
 * Reads a response once the HTTP request is performed.
 *
 * @method _readResponse
 * @param {Object} response
 * @param {String} cacheKey
 * @param {Function} onComplete
 */
ApiClient.prototype._readResponse = function(response, cacheKey, onComplete) {

  var self = this;
  var data = '';

  response.on('data', function (chunk) {
    data += chunk;
  });

  response.on('end', function () {

    var filter = require('../filter')(self._clientId);
    if (filter !== null) {

      var filteredData = filter.apply(data);

      // Something went wrong, we will not return or store anything.
      if (filteredData === null) {
        onComplete(true);
      } else {
        // Notice how we are storing the filtered JSON, not directly 'data'
        // here, that way we avoid having to filter when retrieving the data
        // from the cache.
        MemcacheHandler.set(cacheKey, filteredData.getJSON(), self.DEFAULT_TTL).then(function() {
          onComplete(false, filteredData.getObject());
        });
      }


    } else {
      // Something went wrong in the filtering process.
      onComplete(true);
    }

  });
};

/**
 * Performs a HTTP POST request to an external API.
 *
 * @method POST
 * @param {String} message
 * @param {Object} options
 * @param {String} cacheKey
 * @param {Function} onComplete
 */
ApiClient.prototype.POST = function(message, options, cacheKey, onComplete) {

  var self = this;
  MemcacheHandler.get(cacheKey).then(function(data) {
    onComplete(false, JSON.parse(data));
  }).catch(function() {

    http.request(options, function(response) {
      self._readResponse(response, cacheKey, onComplete);
    }).write(message).end();

  });
};

module.exports = ApiClient;
