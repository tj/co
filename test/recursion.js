
var thunk = require('thunkify');
var co = require('..');
var fs = require('fs');

var read = thunk(fs.readFile);

describe('co() recursion', function(){
  it('should aggregate arrays within arrays', function(done){
    co(function *(){
      var a = read('index.js', 'utf8');
      var b = read('Makefile', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield [a, [b, c]];
      res.should.have.length(2);
      res[0].should.include('exports');
      res[1].should.have.length(2);
      res[1][0].should.include('test');
      res[1][1].should.include('devDependencies');
    })(done);
  })

  it('should aggregate objects within objects', function(done){
    co(function *(){
      var a = read('index.js', 'utf8');
      var b = read('Makefile', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield {
        0: a,
        1: {
          0: b,
          1: c
        }
      };

      res[0].should.include('exports');
      res[1][0].should.include('test');
      res[1][1].should.include('devDependencies');
    })(done);
  })
})