
var thunk = require('thunkify');
var co = require('..');
var fs = require('fs');

var read = thunk(fs.readFile);

// sequential

var sizes = co(function *(){
  var a = yield read('.gitignore');
  var b = yield read('Makefile');
  var c = yield read('package.json');
  return [a.length, b.length, c.length];
});

sizes(function(err, res){
  console.log(res);
});

// parallel

var sizes2 = co(function *(){
  var a = read('.gitignore');
  var b = read('Makefile');
  var c = read('package.json');

  return [
    (yield a).length,
    (yield b).length,
    (yield c).length
  ];
})

sizes2(function(err, res){
  console.log(res);
});