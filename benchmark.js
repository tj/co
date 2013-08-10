
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

exports.compare = {
  'function delegation': function(done){
    co(function *(){
      yield fun;
      yield fun;
      yield fun;
    })(done);
  },

  'function delegation join': function(done){
    co(function *(){
      yield [fun, fun, fun];
    })(done);
  },

  'promise delegation': function(done){
    co(function *(){
      yield getPromise(1);
      yield getPromise(2);
      yield getPromise(3);
    })(done);
  },

  'generator function delegation': function(done){
    co(function *(){
      yield gen;
      yield gen;
      yield gen;
    })(done);
  }
};

require('bench').runMain();