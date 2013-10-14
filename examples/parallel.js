
var co = require('..');
var fs = require('fs');

// by writing this a bit differently than ./simple.js
// you can acheive parallel async operations simply
// be deferring the use of "yield" to act as the callback.

// alternatively you could use ./simple.js with
// var res = yield [a, b, c] to execute them in
// parallel.

// for an alternative see ./join.js
// also if writing all this boilerplate
// is not to your liking check out "thunkify"

function read(file) {
  var finished;
  var error;
  var value;
  var cb;

  fs.readFile(file, 'utf8', function(err, str){
    if (cb) {
      cb(err, str);
    } else {
      finished = true;
      error = err;
      value = str;
    }
  });

  return function(fn){
    if (finished) {
      fn(error, value);
    } else {
      cb = fn;
    }
  }
}

co(function *(){
  var a = read('.gitignore');
  var b = read('Makefile');
  var c = read('package.json');
  console.log(yield a);
  console.log(yield b);
  console.log(yield c);
})()
