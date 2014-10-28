
var read = require('mz/fs').readFile;
var assert = require('assert');

var co = require('..');

describe('co() recursion', function(){
  it('should aggregate arrays within arrays', function(){
    return co(function *(){
      var a = read('index.js', 'utf8');
      var b = read('LICENSE', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield [a, [b, c]];
      assert.equal(2, res.length);
      assert(~res[0].indexOf('exports'));
      assert.equal(2, res[1].length);
      assert(~res[1][0].indexOf('MIT'));
      assert(~res[1][1].indexOf('devDependencies'));
    });
  })

  it('should aggregate objects within objects', function(){
    return co(function *(){
      var a = read('index.js', 'utf8');
      var b = read('LICENSE', 'utf8');
      var c = read('package.json', 'utf8');

      var res = yield {
        0: a,
        1: {
          0: b,
          1: c
        }
      };

      assert(~res[0].indexOf('exports'));
      assert(~res[1][0].indexOf('MIT'));
      assert(~res[1][1].indexOf('devDependencies'));
    });
  })
})
