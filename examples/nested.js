
var co = require('..');
var fs = require('fs');

function size(file) {
  return function(fn){
    fs.stat(file, function(err, stat){
      if (err) return fn(err);
      fn(null, stat.size);
    });
  }
}

var foo = co(function *(){
  var a = yield size('.gitignore');
  var b = yield size('Makefile');
  var c = yield size('package.json');
  return [a, b, c];
})

var bar = co(function *(){
  var a = yield size('examples/return.js');
  var b = yield size('examples/nested.js');
  var c = yield size('examples/simple.js');
  return [a, b, c];
})

co(function *(){
  var a = yield foo;
  var b = yield bar;
  console.log(a);
  console.log(b);
})
