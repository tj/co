
var co = require('..');
var assert = require('assert');

describe('co()(args...)', function(){
  it('should not pass the thunk as an arguments', co(function *(){
    assert.equal(arguments.length, 0);
  }))

  it('should not pass error for nil first argument', function(done){
    co(function *(i){
      assert.equal(i, 0);
    })(0, done);
  });
})
