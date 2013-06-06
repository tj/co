
var Emitter = require('events').EventEmitter;
var co = require('..');

co(function *(){
  var res = yield get('http://google.com');
  console.log('-> %s', res.status);

  var buf;
  while (buf = yield res.read()) {
    console.log(buf.toString());
  }

  console.log('done');
})

// I couldn't get streams2 to work... so, here's a fake request :)

function get(url) {
  console.log('GET %s', url);
  return function(done){
    done(null, new Response);
  }
}

function Response() {
  var self = this;
  this.status = 200;

  var id = setInterval(function(){
    self.emit('data', new Buffer('hello'));
  }, 10);

  setTimeout(function(){
    clearInterval(id);
    self.emit('end');
  }, 200);
}

Response.prototype.__proto__ = Emitter.prototype;

Response.prototype.read = function(){
  var self = this;
  return function(done){
    // push kinda sucks for this... we need to
    // handle whichever comes first with this hack
    self.once('data', function(buf){
      self.removeListener('end', done);
      done(null, buf);
    });

    self.on('end', done);
  }
};
