
var assert = require('assert');

var co = require('..');

function get(val, err, error) {
  return function(done){
    if (error) throw error;
    setTimeout(function(){
      done(err, val);
    }, 10);
  }
}

describe('co(* -> yield fn(done))', function () {
  describe('with no yields', function(){
    it('should work', function(){
      return co(function *(){});
    })
  })

  describe('with one yield', function(){
    it('should work', function(){
      return co(function *(){
        var a = yield get(1);
        assert.equal(1, a);
      });
    })
  })

  describe('with several yields', function(){
    it('should work', function(){
      return co(function *(){
        var a = yield get(1);
        var b = yield get(2);
        var c = yield get(3);

        assert.deepEqual([1, 2, 3], [a, b, c]);
      });
    })
  })

  describe('with many arguments', function(){
    it('should return an array', function(){
      function exec(cmd) {
        return function(done){
          done(null, 'stdout', 'stderr');
        }
      }

      return co(function *(){
        var out = yield exec('something');
        assert.deepEqual(['stdout', 'stderr'], out);
      });
    })
  })

  describe('when the function throws', function(){
    it('should be caught', function(){
      return co(function *(){
        try {
          var a = yield get(1, null, new Error('boom'));
        } catch (err) {
          assert.equal('boom', err.message);
        }
      });
    })
  })

  describe('when an error is passed then thrown', function(){
    it('should only catch the first error only', function(){
      return co(function *() {
        yield function (done){
          done(new Error('first'));
          throw new Error('second');
        }
      }).then(function () {
        throw new Error('wtf')
      }, function(err){
        assert.equal('first', err.message);
      });
    })
  })

  describe('when an error is passed', function(){
    it('should throw and resume', function(){
      var error;

      return co(function *(){
        try {
          yield get(1, new Error('boom'));
        } catch (err) {
          error = err;
        }

        assert('boom' == error.message);
        var ret = yield get(1);
        assert(1 == ret);
      });
    })
  })

  describe('with nested co()s', function(){
    it('should work', function(){
      var hit = [];

      return co(function *(){
        var a = yield get(1);
        var b = yield get(2);
        var c = yield get(3);
        hit.push('one');

        assert.deepEqual([1, 2, 3], [a, b, c])

        yield co(function *(){
          hit.push('two');
          var a = yield get(1);
          var b = yield get(2);
          var c = yield get(3);

          assert.deepEqual([1, 2, 3], [a, b, c])

          yield co(function *(){
            hit.push('three');
            var a = yield get(1);
            var b = yield get(2);
            var c = yield get(3);

            assert.deepEqual([1, 2, 3], [a, b, c])
          });
        });

        yield co(function *(){
          hit.push('four');
          var a = yield get(1);
          var b = yield get(2);
          var c = yield get(3);

          assert.deepEqual([1, 2, 3], [a, b, c])
        });

        assert.deepEqual(['one', 'two', 'three', 'four'], hit);
      });
    })
  })

  describe('return values', function(){
    describe('with a callback', function(){
      it('should be passed', function(){
        return co(function *(){
          return [
            yield get(1),
            yield get(2),
            yield get(3)
          ];
        }).then(function (res) {
          assert.deepEqual([1, 2, 3], res);
        });
      })
    })

    describe('when nested', function(){
      it('should return the value', function(){
        return co(function *(){
          var other = yield co(function *(){
            return [
              yield get(4),
              yield get(5),
              yield get(6)
            ]
          });

          return [
            yield get(1),
            yield get(2),
            yield get(3)
          ].concat(other);
        }).then(function (res) {
          assert.deepEqual([1, 2, 3, 4, 5, 6], res);
        });
      })
    })
  })

  describe('when yielding neither a function nor a promise', function(){
    it('should throw', function(){
      var errors = [];

      return co(function *(){
        try {
          var a = yield 'something';
        } catch (err) {
          errors.push(err.message);
        }

        try {
          var a = yield 'something';
        } catch (err) {
          errors.push(err.message);
        }

        assert.equal(2, errors.length);
        var msg = 'yield a function, promise, generator, array, or object';
        assert(~errors[0].indexOf(msg));
        assert(~errors[1].indexOf(msg));
      });
    })
  })

  describe('with errors', function(){
    it('should throw', function(){
      var errors = [];

      return co(function *(){
        try {
          var a = yield get(1, new Error('foo'));
        } catch (err) {
          errors.push(err.message);
        }

        try {
          var a = yield get(1, new Error('bar'));
        } catch (err) {
          errors.push(err.message);
        }

        assert.deepEqual(['foo', 'bar'], errors);
      });
    })

    it('should catch errors on .send()', function(){
      var errors = [];

      return co(function *(){
        try {
          var a = yield get(1, null, new Error('foo'));
        } catch (err) {
          errors.push(err.message);
        }

        try {
          var a = yield get(1, null, new Error('bar'));
        } catch (err) {
          errors.push(err.message);
        }

        assert.deepEqual(['foo', 'bar'], errors);
      });
    })

    it('should pass future errors to the callback', function(){
      return co(function *(){
        yield get(1);
        yield get(2, null, new Error('fail'));
        assert(false);
        yield get(3);
      }).catch(function(err){
        assert.equal('fail', err.message);
      });
    })

    it('should pass immediate errors to the callback', function(){
      return co(function *(){
        yield get(1);
        yield get(2, new Error('fail'));
        assert(false);
        yield get(3);
      }).catch(function(err){
        assert.equal('fail', err.message);
      });
    })

    it('should catch errors on the first invocation', function(){
      return co(function *(){
        throw new Error('fail');
      }).catch(function(err){
        assert.equal('fail', err.message);
      });
    })
  })
})
