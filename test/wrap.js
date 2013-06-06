
var co = require('..');
var fs = require('fs');

var read = co.wrap(fs.readFile);

describe('co.wrap(fn)', function(){
  it('should return a thunk', function(done){
    co(function *(){
      var a = yield read('index.js', 'utf8');
      var b = yield read('Makefile');
      a.should.include('exports');
      b.should.be.an.instanceof(Buffer);
      done();
    });
  })
})
