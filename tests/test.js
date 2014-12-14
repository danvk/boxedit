'use strict';

var assert = require('assert'),
    box = require('../box');

describe('splitLine', function() {
  it('should split a line in two', function() {
    var txt = 'h 700 1000 800 1050 0\n' +
              'a 800 1000 850 1050 0';
    assert.deepEqual(box.splitLine(txt, 0, 2),
                     'h 700 1000 750 1050 0\n' +
                     'h 750 1000 800 1050 0\n' +
                     'a 800 1000 850 1050 0');
  });
});
