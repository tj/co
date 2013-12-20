
var co = require('..');
var assert = require('assert');

describe('co()(args...)', function(){
  it('should not pass the thunk as an arguments', co(function *(){
    assert.equal(arguments.length, 0);
  }))
})