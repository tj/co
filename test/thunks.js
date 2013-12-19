
var co = require('..');
var assert = require('assert');

function get(val, err, error) {
  return function(done){
    if (error) throw error;
    setTimeout(function(){
      done(err, val);
    }, 10);
  }
}

describe('co(fn)', function(){
  describe('with no yields', function(){
    it('should work', function(done){
      co(function *(){

      })(done);
    })
  })

  describe('with one yield', function(){
    it('should work', function(done){
      co(function *(){
        var a = yield get(1);
        a.should.equal(1);
      })(done);
    })
  })

  describe('with several yields', function(){
    it('should work', function(done){
      co(function *(){
        var a = yield get(1);
        var b = yield get(2);
        var c = yield get(3);

        [a,b,c].should.eql([1,2,3]);
      })(done);
    })
  })

  describe('with many arguments', function(){
    it('should return an array', function(done){
      function exec(cmd) {
        return function(done){
          done(null, 'stdout', 'stderr');
        }
      }

      co(function *(){
        var out = yield exec('something');
        out.should.eql(['stdout', 'stderr']);
      })(done);
    })
  })

  describe('when the function throws', function(){
    it('should be caught', function(done){
      co(function *(){
        try {
          var a = yield get(1, null, new Error('boom'));
        } catch (err) {
          err.message.should.equal('boom');
        }
      })(done);
    })
  })

  describe('when an error is passed then thrown', function(){
    it('should only catch the first error only', function(done){
      co(function *() {
        yield function (done){
          done(new Error('first'));
          throw new Error('second');
        }
      })(function(err){
        err.message.should.equal('first');
        done();
      });
    })
  })

  describe('when an error is passed', function(){
    it('should throw and resume', function(done){
      var error;

      co(function *(){
        try {
          yield get(1, new Error('boom'));
        } catch (err) {
          error = err;
        }

        assert('boom' == error.message);
        var ret = yield get(1);
        assert(1 == ret);
      })(done);
    })
  })

  describe('with nested co()s', function(){
    it('should work', function(done){
      var hit = [];

      co(function *(){
        var a = yield get(1);
        var b = yield get(2);
        var c = yield get(3);
        hit.push('one');

        [a,b,c].should.eql([1,2,3]);

        yield co(function *(){
          hit.push('two');
          var a = yield get(1);
          var b = yield get(2);
          var c = yield get(3);

          [a,b,c].should.eql([1,2,3]);

          yield co(function *(){
            hit.push('three');
            var a = yield get(1);
            var b = yield get(2);
            var c = yield get(3);

            [a,b,c].should.eql([1,2,3]);
          });
        });

        yield co(function *(){
          hit.push('four');
          var a = yield get(1);
          var b = yield get(2);
          var c = yield get(3);

          [a,b,c].should.eql([1,2,3]);
        });

        hit.should.eql(['one', 'two', 'three', 'four']);
      })(done);
    })
  })

  describe('return values', function(){
    describe('with a callback', function(){
      it('should be passed', function(done){
        var fn = co(function *(){
          return [
            yield get(1),
            yield get(2),
            yield get(3)
          ];
        });

        fn(function(err, res){
          if (err) return done(err);
          res.should.eql([1,2,3]);
          done();
        });
      })
    })

    describe('when nested', function(){
      it('should return the value', function(done){
        var fn = co(function *(){
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
        });

        fn(function(err, res){
          if (err) return done(err);
          res.should.eql([1,2,3,4,5,6]);
          done();
        });
      })
    })
  })

  describe('when yielding neither a function nor a promise', function(){
    it('should throw', function(done){
      var errors = [];

      co(function *(){
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

        var msg = 'yield a function, promise, generator, array, or object';
        errors.should.eql([msg, msg]);
      })(done);
    })
  })

  describe('with errors', function(){
    it('should throw', function(done){
      var errors = [];

      co(function *(){
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

        errors.should.eql(['foo', 'bar']);
      })(done);
    })

    it('should catch errors on .send()', function(done){
      var errors = [];

      co(function *(){
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

        errors.should.eql(['foo', 'bar']);
      })(done);
    })

    it('should pass future errors to the callback', function(done){
      co(function *(){
        yield get(1);
        yield get(2, null, new Error('fail'));
        assert(false);
        yield get(3);
      })(function(err){
        err.message.should.equal('fail');
        done();
      });
    })

    it('should pass immediate errors to the callback', function(done){
      co(function *(){
        yield get(1);
        yield get(2, new Error('fail'));
        assert(false);
        yield get(3);
      })(function(err){
        err.message.should.equal('fail');
        done();
      });
    })

    it('should catch errors on the first invocation', function(done){
      co(function *(){
        throw new Error('fail');
      })(function(err){
        err.message.should.equal('fail');
        done();
      });
    })

    describe('when no callback is provided', function(){
      it('should rethrow', function(done){
        var addProcessListeners = removeProcessListeners();

        process.once('uncaughtException', function(err){
          err.message.should.equal('boom');
          addProcessListeners();
          done();
        })

        co(function *(){
          yield function (done) {
            setImmediate(function () {
              done(new Error('boom'));
            })
          }
        })();
      })

      it('should rethrow on a synchronous thunk', function(done){
        var addProcessListeners = removeProcessListeners();

        process.once('uncaughtException', function(err){
          err.message.should.equal('boom');
          addProcessListeners();
          done();
        })

        co(function *(){
          yield function (done) {
            done(new Error('boom'));
          }
        })();
      })
    })
  })
})

function removeProcessListeners(){
  // Remove mocha listeners first.
  var listeners = process.listeners('uncaughtException');
  process.removeAllListeners('uncaughtException');

  return function addProcessListeners(){
    listeners.forEach(function(listener){
      process.on('uncaughtException', listener);
    });
  }
}