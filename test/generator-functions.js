
var assert = require('assert');
var co = require('..');

function sleep(ms) {
  return function(done){
    setTimeout(done, ms);
  }
}

function *work() {
  yield sleep(50);
  return 'yay';
}

describe('co(fn*)', function(){
  describe('with a generator function', function(){
    it('should wrap with co()', function(){
      return co(function *(){
        var a = yield work;
        var b = yield work;
        var c = yield work;

        assert('yay' == a);
        assert('yay' == b);
        assert('yay' == c);

        var res = yield [work, work, work];
        assert.deepEqual(['yay', 'yay', 'yay'], res);
      });
    })

    it('should catch errors', function(){
      return co(function *(){
        yield function *(){
          throw new Error('boom');
        };
      }).then(function () {
        throw new Error('wtf')
      }, function (err) {
        assert(err);
        assert(err.message == 'boom');
      });
    })
  })
})
