# Co

  Generator based flow-control goodness for nodejs (and soon the browser), using
  thunks instead of promises, letting you write non-blocking code in a nice-ish
  way.

  Currently you must use the `--harmony` or `--harmony-generators` flags when
  running node 0.11.x to get access to generators.

## Installation

```
$ npm install co
```

## Associated libraries

  - [co-fs](https://github.com/visionmedia/co-fs) - core `fs` function wrappers

## Example

```js
var co = require('co');

co(function *(){
  var a = yield get('http://google.com');
  var b = yield get('http://yahoo.com');
  var c = yield get('http://cloudup.com');
  console.log(a.status);
  console.log(b.status);
  console.log(c.status);
})
```

## Why not promises?

  I'm not a fan of promises personally, but preferences aside this
  is an extremely minimal layer between the traditional node `(err, result)`
  style callback using thunks. All you need to do is return a function, this
  function behaves as the "thunk" or "future" that is `yield`ed to Co.

  For example take `fs.readFile`, we all know the signature is:

```js
fs.readFile(path, encoding, function(err, result){

});
```

  To work with Co we need a function to return another function of
  the same signature:

```js
fs.readFile(path, encoding)(function(err, result){

});
```

  Which basically looks like this:

```js
function read(path, encoding) {
  return function(cb){
    fs.readFile(path, encoding, cb);
  }
}
```

  This is what the `co.wrap(fn)` utility function does for you.

## API

### co(fn)

  Pass a generator `fn` which is immediately invoked. Any `yield` expressions
  within _must_ return a "thunk", at which point `co()` will defer execution.

```js
var co = require('co');
var fs = require('fs');

function read(file) {
  return function(fn){
    fs.readFile(file, 'utf8', fn);
  }
}

co(function *(){
  var a = yield read('.gitignore');
  var b = yield read('Makefile');
  var c = yield read('package.json');
  console.log(a);
  console.log(b);
  console.log(c);
});
```

#### Nesting co() calls

  The `co()` function itself returns a thunk, this means you can nest appropriately:

```js
var co = require('co');
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
  var a = yield size('examples/parallel.js');
  var b = yield size('examples/nested.js');
  var c = yield size('examples/simple.js');
  return [a, b, c];
})

co(function *(){
  var a = yield foo;
  var b = yield bar;
  console.log(a);
  console.log(b);
});
```

  Or a variation of the same thing:

```js
var co = require('co');
var fs = require('fs');

function size(file) {
  return function(fn){
    fs.stat(file, function(err, stat){
      if (err) return fn(err);
      fn(null, stat.size);
    });
  }
}

co(function *(){
  var a = yield co(function *(){
    var a = yield size('.gitignore');
    var b = yield size('Makefile');
    var c = yield size('package.json');
    return [a, b, c];
  })

  var b = yield co(function *(){
    var a = yield size('examples/parallel.js');
    var b = yield size('examples/nested.js');
    var c = yield size('examples/simple.js');
    return [a, b, c];
  })

  console.log(a);
  console.log(b);
});
```

#### co() return values

  Since `co()` returns a thunk, you may pass a function to this thunk
  to receive the `return` values from the generator. Any error that occurs
  is passed to this (`sizes`) function.

```js

var co = require('co');
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
```

### co.wrap(fn, [ctx])

  The `co.wrap()` utility simply wraps a node-style function to return a thunk.

```js

var co = require('co');
var fs = require('fs');

var read = co.wrap(fs.readFile);

co(function *(){
  var a = yield read('.gitignore');
  var b = yield read('Makefile', 'ascii');
  var c = yield read('package.json', 'utf8');
  console.log(a);
  console.log(b);
  console.log(c);
});
```

Optionally you may pass the `fn`'s receiver as the `ctx` as shown here:

```js

var co = require('co')
var redis = require('redis')
var db = redis.createClient()

db.set = co.wrap(db.set, db)
db.get = co.wrap(db.get, db)

co(function *(){
  yield db.set('foo', 'bar')
  yield db.set('bar', 'baz')

  var res = yield db.get('foo')
  console.log('foo -> %s', res);

  var res = yield db.get('bar')
  console.log('bar -> %s', res);
})
```

### co.join(fn...)

  The `co.join()` utility function allows you to pass multiple thunks, or an array
  of thunks and "join" them all into a single thunk which executes them all concurrently,
  instead of in sequence. Note that the resulting array ordering _is_ retained.

```js

var co = require('co');
var join = co.join;
var fs = require('fs');

function size(file) {
  return function(fn){
    fs.stat(file, function(err, stat){
      if (err) return fn(err);
      fn(null, stat.size);
    });
  }
}

co(function *(){
  var a = size('.gitignore');
  var b = size('index.js');
  var c = size('Makefile');
  var res = yield join(a, b, c);
  console.log(res);
  // => [ 13, 1687, 129 ]
});
```

## FAQ

### How does this compare to taskjs?

  - it's smaller
  - it's not a scheduler
  - you can use thunks (functions)
  - you can use promises

### Does it work with streams?

  Not out of the box, but if you're willing to fight node a bit you can
  wrestle streams into something usable:

```js
co(function *(){
  var res = yield get('http://google.com');
  console.log('-> %s', res.status);

  var buf;
  while (buf = yield res.read()) {
    console.log(buf.toString());
  }

  console.log('done');
})
```

### Performance

  On my machine 30,000 sequential stat()s takes an avg of 570ms,
  while the same number of sequential stat()s with `co()` takes
  610ms, aka the overhead introduced by generators is _extremely_ negligable.

## License

  MIT

