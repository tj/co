
var read = require('mz/fs').readFile;
var assert = require('assert');

var co = require('..');

describe('co(* -> yield [])', function(){
  it('should aggregate several thunks', function(){
    return co(function *(){
      var a = read('index.js', 'utf8');
      var b = read('LICENSE', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield [a, b, c];
      assert.equal(3, res.length);
      assert(~res[0].indexOf('exports'));
      assert(~res[1].indexOf('MIT'));
      assert(~res[2].indexOf('devDependencies'));
    });
  })

  it('should noop with no args', function(){
    return co(function *(){
      var res = yield [];
      assert.equal(0, res.length);
    });
  })

  it('should support an array of generators', function(){
    return co(function*(){
      var val = yield [function*(){ return 1 }()]
      assert.deepEqual(val, [1])
    })
  })
})
