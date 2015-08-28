/*jslint node: true */
/*global describe, it */
'use strict';

var expect = require('expect.js');

/**
 * Unit tests for the object Filter
 * @see ../../core/filter.js
 */
describe('Filter', function(){

  describe('Initialization', function() {

    it('Instantiating the filter object', function() {
      // An invalid identifier returns null object
      var filter = require('../../core/filter')('test');
      expect(filter).to.be(null);
    });

  });

  describe('Filtering', function() {

    /**
     * Mocks the data returned by a service
     * @type {Object} rawTestData
     */

    var rawTestData = {
      TripList: {
        Trip: [{
          LegList: {
            Leg: [{
              name: 'entry name',
              dist: '5',
              Origin: {
                name: 'origin',
                lat: '59.8',
                lon: '17.7',
                time: '2015-08-22T22:00:00'
              },
              Destination: {
                name: 'destination',
                lat: '59.8',
                lon: '17.6',
                time: '2015-08-22T30:00:00'
              }
            }]
          }
        }]
      }
    };

  });

});
