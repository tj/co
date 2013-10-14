
var co = require('..');
var assert = require('assert');

function sleep(ms) {
  return function(done){
    setTimeout(done, ms);
  }
}

function *work() {
  yield sleep(50);
  return 'yay';
}

describe('co(fn)', function(){
  describe('with a generator function', function(){
    it('should wrap with co()', function(done){
      co(function *(){
        var a = yield work;
        var b = yield work;
        var c = yield work;

        assert('yay' == a);
        assert('yay' == b);
        assert('yay' == c);

        var res = yield [work, work, work];
        res.should.eql(['yay', 'yay', 'yay']);
      })(done);
    })
  })
})
