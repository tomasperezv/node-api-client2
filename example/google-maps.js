/*jslint node: true */
'use strict';

var ApiClient = require('../core/api/api-client');

/**
 * The GoogleApiClient object performs requests to the google maps API,
 * we use it to compute routes between different points in order to render
 * real time location information on the public transport buses.
 *
 * This object inherits from the ApiClient object.
 *
 * @see http://maps.googleapis.com/maps/api/directions/output?parameters
 * @constructor
 * @class GoogleApiClient
 * @constructor
 */
var GoogleApiClient = function() {

  ApiClient.call(this);

  /**
   * @type {String} _clientId
   * @private
   */
  this._clientId = 'maps-directions';

  // Override the default parameters
  this._baseUrl = '';
  this._defaultParameters.key = '';

};

GoogleApiClient.prototype = new ApiClient();

/**
 * @param {Object} origin
 *  {Float} latitude
 *  {Float} longitude
 ** @param {Object|String} destination
 *  {Float} latitude
 *  {Float} longitude
 * @param {Function} onComplete
 * @method directions
 * @public
 */
GoogleApiClient.prototype.directions = function(origin, destination, onComplete) {

  origin = origin.latitude + ',' + origin.longitude;

  if (typeof destination === 'object') {
    destination = destination.latitude + ',' + destination.longitude;
  }

  var cacheKey = this._getMCKey(origin, destination + '10');

  var parameters = {
    origin: origin,
    destination: destination
  };

  // Requests to the google maps api need to go through https,
  // for that reason we use the useHTTPS boolean.
  this.GET(parameters, cacheKey, onComplete, true);
};

module.exports = GoogleApiClient;
