/*jslint node: true */ 
'use strict';

/**
 * @class InvalidConfig
 * @param {String} message
 * @constructor
 */
var InvalidConfig = function(message) {
  this.message = message;
  this.name = 'InvalidConfig';
};

/**
 * @class InvalidMemcacheKey
 * @param {String} message
 * @constructor
 */
var InvalidMemcacheKey = function(message) {
  this.message = message;
  this.name = 'InvalidMemcacheKey';
};

/**
 * @class FilterNotFound
 * @param {String} message
 * @constructor
 */
var FilterNotFound = function(message) {
  this.message = message;
  this.name = 'FilterNotFound';
};

module.exports = {
  InvalidConfig: InvalidConfig,
  FilterNotFound: FilterNotFound,
  InvalidMemcacheKey: InvalidMemcacheKey
};
