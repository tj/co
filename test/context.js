
var assert = require('assert');

var co = require('..');

var ctx = {
  some: 'thing'
};

describe('co.call(this)', function () {
  it('should pass the context', function () {
    return co.call(ctx, function *(){
      assert(ctx == this);
    });
  })
})
