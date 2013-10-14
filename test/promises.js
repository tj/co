
var co = require('..');
var assert = require('assert');
var Q = require('q');

function getPromise(val, err) {
  return Q.fcall(function(){
    if (err) throw err;
    return val;
  });
}

describe('co(fn)', function(){
  describe('with one promise yield', function(){
    it('should work', function(done){
      co(function *(){
        var a = yield getPromise(1);
        a.should.equal(1);
      })(done);
    })
  })

  describe('with several promise yields', function(){
    it('should work', function(done){
      co(function *(){
        var a = yield getPromise(1);
        var b = yield getPromise(2);
        var c = yield getPromise(3);

        [a,b,c].should.eql([1,2,3]);
      })(done);
    })
  })

  describe('when a promise is rejected', function(){
    it('should throw and resume', function(done){
      var error;

      co(function *(){
        try {
          yield getPromise(1, new Error('boom'));
        } catch (err) {
          error = err;
        }

        assert('boom' == error.message);
        var ret = yield getPromise(1);
        assert(1 == ret);
      })(done);
    })
  })
})
