
var assert = require('assert');

var co = require('..');

describe('yield <invalid>', function () {
  it('should throw an error', function () {
    return co(function* () {
      try {
        yield null;
        throw new Error('lol');
      } catch (err) {
        assert(err instanceof TypeError);
        assert(~err.message.indexOf('You may only yield'));
      }
    })
  })
})
