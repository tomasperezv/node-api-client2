/*jslint node: true */
'use strict';

var exception = require('./exception/exception');
var Logger = require('./logger');

/**
 * The Filter object is used by the aggregation layer to filter the
 * data returned by the services and the database, in order to be sent
 * to the clients containing only required fields.
 *
 * @class Filter
 * @param {String} filterId
 * @param {Object} filterSchema
 * @constructor
 * @tests ../test/core/filter.js
 */
var Filter = function(filterId, filterSchema) {
  this._filterSchema = filterSchema;
};

/**
 * Used by the 'apply' method to given a raw object extract
 * uniquely the fields that we want based on the definition schema.
 *
 * @param {Object} responseObject
 * @method _applyFilterSchema
 * @return {Object}
 */
Filter.prototype._applyFilterSchema = function(responseObject) {

  var schema = this._filterSchema;

  // This is needed in order to obtain the property from the original
  // object that contains the array with the entries. In some of the
  // API's the results are hidden in a hierarchy of nested objects.
  // i.e. Result.Response.Values
  var entries = schema.getEntries(responseObject);

  var filteredObject = [];
  entries.map(function(entry) {
    filteredObject.push(schema.filter(entry));
  });

  return filteredObject;
};

/**
 * We are not going to return directly the filtered object, instead
 * we want to expose it encapsulated via an interface that helps
 * to fetch is content either as an object or a string. That will ease
 * the interactions with the cache layer.
 *
 * @method _getResultInterface
 * @param {Object} filteredObject
 * @return {Object}
 * @private
 */
Filter.prototype._getResultInterface = function(filteredObject) {

  return {
    getObject: function() {
      return filteredObject;
    },
    getJSON: function() {
      return JSON.stringify(filteredObject);
    }
  };

};

/**
 * We assume that every rawData passed to a filter is a JSON object,
 * that we are going to try to parse and filter. If the process fails due to
 * any reason (e.g. invalid JSON), we are going to return null. Clients of
 * the filter objects need to take this into consideration.
 *
 * @method apply
 * @param {String} rawData
 * @public
 * @return {Object|null}
 */
Filter.prototype.apply = function(rawData) {

  var result = null;
  try {
    var responseObject = JSON.parse(rawData);
    var filteredObject = this._applyFilterSchema(responseObject);

    result = this._getResultInterface(filteredObject);

  } catch(e) {
    Logger.error(e);
  }

  return result;
};

module.exports = function(filterId, filterSchema) {

  // Try to instantiate a filter based on the provided identifier.
  var filter = null;
  try {
    filter = new Filter(filterId, filterSchema);
  } catch (e) {
    Logger.error('We could not find a filter for ' + filterId);
  }

  return filter;
};
