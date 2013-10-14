
var co = require('..');
var fs = require('fs');

// by writing this a bit differently than ./simple.js
// you can acheive parallel async operations simply
// be deferring the use of "yield" to act as the callback

// alternatively you could use ./simple.js with
// var res = yield [a, b, c] to execute them in
// parallel.

function read(file) {
  var done;

  fs.readFile(file, 'utf8', function(err, val){
    done(err, val);
  });

  return function(fn){
    done = fn;
  }
}

co(function *(){
  var a = read('.gitignore');
  var b = read('Makefile');
  var c = read('package.json');
  console.log(yield a);
  console.log(yield b);
  console.log(yield c);
})
