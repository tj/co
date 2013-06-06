
var co = require('..');
var fs = require('fs');

var read = co.wrap(fs.readFile);

co(function *(){
  var a = yield read('.gitignore');
  var b = yield read('Makefile', 'ascii');
  var c = yield read('package.json', 'utf8');
  console.log(a);
  console.log(b);
  console.log(c);
})
