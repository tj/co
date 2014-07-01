
var co = require('./');
var bluebird = require('bluebird');


function fun(done) {
  done();
}

function *gen() {

}

function getPromise(val, err) {
  return new bluebird(function (resolve, reject) {
    if (err) reject(err);
    else resolve(val);
  });
}

suite('co()', function(){
  set('mintime', process.env.MINTIME | 0 || 2000)

  bench('promises', function(done){
    co(function *(){
      yield setImmediate;
      yield getPromise(1);
      yield getPromise(2);
      yield getPromise(3);
    })(done);
  })

  bench('thunks', function(done){
    co(function *(){
      yield setImmediate;
      yield fun;
      yield fun;
      yield fun;
    })(done);
  })

  bench('arrays', function(done){
    co(function *(){
      yield setImmediate;
      yield [fun, fun, fun];
    })(done);
  })

  bench('objects', function(done){
    co(function *(){
      yield setImmediate;
      yield {
        a: fun,
        b: fun,
        c: fun
      };
    })(done);
  })

  bench('generators', function(done){
    co(function *(){
      yield setImmediate;
      yield gen();
      yield gen();
      yield gen();
    })(done);
  })

  bench('generators delegated', function(done){
    co(function *(){
      yield setImmediate;
      yield* gen();
      yield* gen();
      yield* gen();
    })(done);
  })

  bench('generator functions', function(done){
    co(function *(){
      yield setImmediate;
      yield gen;
      yield gen;
      yield gen;
    })(done);
  })
})
