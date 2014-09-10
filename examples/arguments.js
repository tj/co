
var thunk = require('thunkify');
var co = require('..');
var fs = require('fs');

var read = thunk(fs.readFile);

// parallel

function* sizeGen(file1, file2){
  var a = read(file1);
  var b = read(file2);

  return [
    (yield a).length,
    (yield b).length
  ];
}

// use co to wrap generatorFunction into callback style

var size = co(sizeGen);

// use `size` as common async callback style function
// all arguments will pass to `function* sizeGen`

size('.gitignore', 'README.md', function (err, res) {
  if (err) return console.error(err);
  console.log(res);
});
