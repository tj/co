
var co = require('./');
var Q = require('q');


function fun(done) {
  done();
}

function *gen() {

}

function getPromise(val, err) {
  return Q.fcall(function(){
    if (err) throw err;
    return val;
  });
}

suite('co()', function(){
  set('mintime', process.env.MINTIME | 0 || 1)

  bench('promises', function(done){
    co(function *(){
      yield getPromise(1);
      yield getPromise(2);
      yield getPromise(3);
    })(done);
  })

  bench('thunks', function(done){
    co(function *(){
      yield fun;
      yield fun;
      yield fun;
    })(done);
  })

  bench('arrays', function(done){
    co(function *(){
      yield [fun, fun, fun];
    })(done);
  })

  bench('objects', function(done){
    co(function *(){
      yield {
        a: fun,
        b: fun,
        c: fun
      };
    })(done);
  })

  bench('generators', function(done){
    co(function *(){
      yield gen();
      yield gen();
      yield gen();
    })(done);
  })

  bench('generators delegated', function(done){
    co(function *(){
      yield* gen();
      yield* gen();
      yield* gen();
    })(done);
  })

  bench('generator functions', function(done){
    co(function *(){
      yield gen;
      yield gen;
      yield gen;
    })(done);
  })
})