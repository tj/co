
var co = require('..');
var fs = require('fs');
var join = co.join;

function size(file) {
  return function(fn){
    fs.stat(file, function(err, stat){
      if (err) return fn(err);
      fn(null, stat.size);
    });
  }
}

// 3 concurrent stat()s at a time

co(function *(){
  var a = yield join(size('.gitignore'), size('index.js'), size('Makefile'));
  var b = yield join(size('.gitignore'), size('index.js'), size('Makefile'));
  var c = yield join(size('.gitignore'), size('index.js'), size('Makefile'));
  console.log(a);
  console.log(b);
  console.log(c);
})()

// 9 concurrent stat()s

co(function *(){
  var a = join(size('.gitignore'), size('index.js'), size('Makefile'));
  var b = join(size('.gitignore'), size('index.js'), size('Makefile'));
  var c = join(size('.gitignore'), size('index.js'), size('Makefile'));
  var d = yield join(a, b, c);
  console.log(d);
})()

// 3

co(function *(){
  var a = size('.gitignore');
  var b = size('index.js');
  var c = size('Makefile');
  var res = yield join(a, b, c);
  console.log(res);
})()

// 3 with array syntax

co(function *(){
  var a = size('.gitignore');
  var b = size('index.js');
  var c = size('Makefile');
  var res = yield [a, b, c];
  console.log(res);
})()

