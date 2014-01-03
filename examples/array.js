
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

// 3 concurrent stat()s at a time

co(function *(){
  var a = yield [size('.gitignore'), size('index.js'), size('Makefile')];
  var b = yield [size('.gitignore'), size('index.js'), size('Makefile')];
  var c = yield [size('.gitignore'), size('index.js'), size('Makefile')];
  console.log(a);
  console.log(b);
  console.log(c);
})()

// 9 concurrent stat()s

co(function *(){
  var a = [size('.gitignore'), size('index.js'), size('Makefile')];
  var b = [size('.gitignore'), size('index.js'), size('Makefile')];
  var c = [size('.gitignore'), size('index.js'), size('Makefile')];
  var d = yield [a, b, c];
  console.log(d);
})()

// 3

co(function *(){
  var a = size('.gitignore');
  var b = size('index.js');
  var c = size('Makefile');
  var res = yield [a, b, c];
  console.log(res);
})()
