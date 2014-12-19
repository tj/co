
var assert = require('assert');

var co = require('..');

function getPromise(val, err) {
  return new Promise(function (resolve, reject) {
    if (err) reject(err);
    else resolve(val);
  });
}

describe('co(* -> yield <promise>', function(){
  describe('with one promise yield', function(){
    it('should work', function(){
      return co(function *(){
        var a = yield getPromise(1);
        assert.equal(1, a);
      });
    })
  })

  describe('with several promise yields', function(){
    it('should work', function(){
      return co(function *(){
        var a = yield getPromise(1);
        var b = yield getPromise(2);
        var c = yield getPromise(3);

        assert.deepEqual([1, 2, 3], [a, b, c]);
      });
    })
  })

  describe('when a promise is rejected', function(){
    it('should throw and resume', function(){
      var error;

      return co(function *(){
        try {
          yield getPromise(1, new Error('boom'));
        } catch (err) {
          error = err;
        }

        assert('boom' == error.message);
        var ret = yield getPromise(1);
        assert(1 == ret);
      });
    })
  })

  describe('when yielding a non-standard promise-like', function(){
    it('should return a real Promise', function() {
      assert(co(function *(){
        yield { then: function(){} };
      }) instanceof Promise);
    });
  })
})
