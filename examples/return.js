
var co = require('..');
var fs = require('fs');

var read = co.wrap(fs.readFile);

var sizes = co(function *(){
  var a = yield read('.gitignore');
  var b = yield read('Makefile');
  var c = yield read('package.json');
  return [a.length, b.length, c.length];
});

sizes(function(err, res){
  console.log(res);
});
