
var thunk = require('thunkify');
var co = require('..');
var fs = require('fs');

var read = thunk(fs.readFile);

describe('co(* -> yield {})', function(){
  it('should aggregate several thunks', function(done){
    co(function *(){
      var a = read('index.js', 'utf8');
      var b = read('Makefile', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield {
        a: a,
        b: b,
        c: c
      };

      Object.keys(res).should.have.length(3);
      res.a.should.include('exports');
      res.b.should.include('test');
      res.c.should.include('devDependencies');
    })(done);
  })

  it('should noop with no args', function(done){
    co(function *(){
      var res = yield {};
      Object.keys(res).should.have.length(0);
    })(done);
  })

  it('should ignore non-thunkable properties', function(done){
    co(function *(){
      var foo = {
        name: { first: 'tobi' },
        age: 2,
        address: read('index.js', 'utf8'),
        tobi: new Pet('tobi'),
        now: new Date
      };

      var res = yield foo

      res.name.should.eql({ first: 'tobi' });
      res.age.should.equal(2);
      res.tobi.name.should.equal('tobi');
      res.now.should.equal(foo.now);
      res.address.should.include('exports');
    })(done);
  })
})

function Pet(name) {
  this.name = name;
  this.something = function(){};
}