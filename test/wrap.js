
var assert = require('assert');

var co = require('..');

describe('co.wrap(fn*)', function () {
  it('should pass context', function () {
    var ctx = {
      some: 'thing'
    };

    return co.wrap(function* () {
      assert.equal(ctx, this);
    }).call(ctx);
  })

  it('should pass arguments', function () {
    return co.wrap(function* (a, b, c) {
      assert.deepEqual([1, 2, 3], [a, b, c]);
    })(1, 2, 3);
  })
})
