var co = require('..');
var assert = require('assert');

describe('bugs', function(){
  it('#92', function(done){
    var addProcessListeners = removeProcessListeners();

    process.once('uncaughtException', function(err){
      err.message.should.equal('boom');
      addProcessListeners();
      done();
    })

    co(function *() {
      yield function (done) {
        done(new Error('boom'))
      }
    })(function(err) {
      if (err) throw err;
    });
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