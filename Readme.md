# Co

  [![Build Status](https://travis-ci.org/visionmedia/co.png?branch=master)](https://travis-ci.org/visionmedia/co)

  Generator based flow-control goodness for nodejs (and soon the browser), using
  thunks _or_ promises, letting you write non-blocking code in a nice-ish
  way.

  Currently you must use the `--harmony-generators` flag when
  running node 0.11.x to get access to generators. Or use gnode to spawn your node instance. 
  However note that performance degrades quickly compared to 0.11.x.

  Co is careful to relay any errors that occur back to the generator, including those
  within the thunk, or from the thunk's callback. "Uncaught" exceptions in the generator
  are passed to `co()`'s thunk.

  Make sure to view the [examples](https://github.com/visionmedia/co/tree/master/examples).

## Installation

```
$ npm install co
```

## Associated libraries

  View the [wiki](https://github.com/visionmedia/co/wiki) for libraries that
  work well with Co.

## Example

```js
var co = require('co');
var thunkify = require('thunkify');
var request = require('request');
var get = thunkify(request.get);

co(function *(){
  var a = yield get('http://google.com');
  var b = yield get('http://yahoo.com');
  var c = yield get('http://cloudup.com');
  console.log(a.status);
  console.log(b.status);
  console.log(c.status);
})()

co(function *(){
  var a = get('http://google.com');
  var b = get('http://yahoo.com');
  var c = get('http://cloudup.com');
  var res = yield [a, b, c];
  console.log(res);
})()
```

## Yieldables

  The "yieldable" objects currently supported are:

  - promises
  - thunks (functions)
  - array (parallel execution)
  - objects (parallel execution)
  - generators (delegation)
  - generator functions (delegation)

To convert a regular node function that accepts a callback into one which returns a thunk you may want to use [thunkify](https://github.com/visionmedia/node-thunkify) or similar.

## Thunks vs promises

  While co supports promises, you may return "thunks" from your functions,
  which otherwise behaves just like the traditional node-style callback
  with a signature of: `(err, result)`.


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

## Receiver propagation

  When `co` is invoked with a receiver it will propagate to most yieldables,
  allowing you to alter `this`.

```js
var ctx = {};

function foo() {
  assert(this == ctx);
}

co(function *(){
  assert(this == ctx);
  yield foo;
}).call(ctx)
```

  You also pass arguments through the generator:

```js
co(function *(a){
  assert(this == ctx);
  assert('yay' == a);
  yield foo;
}).call(ctx, 'yay');
```

## API

### co(fn)

  Pass a generator `fn` and return a thunk. The thunk's signature is
  `(err, result)`, where `result` is the value passed to the `return`
  statement.

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
  return [a, b, c];
})()
```

  You may also yield `Generator` objects to support nesting:


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

function *foo(){
  var a = yield size('.gitignore');
  var b = yield size('Makefile');
  var c = yield size('package.json');
  return [a, b, c];
}

function *bar(){
  var a = yield size('examples/parallel.js');
  var b = yield size('examples/nested.js');
  var c = yield size('examples/simple.js');
  return [a, b, c];
}

co(function *(){
  var a = yield foo();
  var b = yield bar();
  console.log(a);
  console.log(b);
})()
```

  Or if the generator functions do not require arguments, simply `yield` the function:

```js
var thunkify = require('thunkify');
var request = require('superagent');

var get = thunkify(request.get);

function *results() {
  var a = yield get('http://google.com')
  var b = yield get('http://yahoo.com')
  var c = yield get('http://ign.com')
  return [a.status, b.status, c.status]
}

co(function *(){
  // 3 concurrent requests at a time
  var a = yield results;
  var b = yield results;
  var c = yield results;
  console.log(a, b, c);

  // 9 concurrent requests
  console.log(yield [results, results, results]);
})()
```

  If a thunk is written to execute immediately you may acheive parallelism
  by simply `yield`-ing _after_ the call. The following are equivalent since
  each call kicks off execution immediately:

```js
co(function *(){
  var a = size('package.json');
  var b = size('Readme.md');
  var c = size('Makefile');

  return [yield a, yield b, yield c];
})()
```

  Or:

```js
co(function *(){
  var a = size('package.json');
  var b = size('Readme.md');
  var c = size('Makefile');

  return yield [a, b, c];
})()
```

  You can also pass arguments into the generator. The last argument, `done`, is
  the callback function. Here's an example:

```js
var exec = require('co-exec');
co(function *(cmd) {
  var res = yield exec(cmd);
  return res;
})('pwd', done);
```

### yield array

  By yielding an array of thunks you may "join" them all into a single thunk which executes them all concurrently,
  instead of in sequence. Note that the resulting array ordering _is_ retained.

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
  var a = size('.gitignore');
  var b = size('index.js');
  var c = size('Makefile');
  var res = yield [a, b, c];
  console.log(res);
  // => [ 13, 1687, 129 ]
})()
```

Nested arrays may also be expressed as simple nested arrays:

```js
var a = [
  get('http://google.com'),
  get('http://yahoo.com'),
  get('http://ign.com')
];

var b = [
  get('http://google.com'),
  get('http://yahoo.com'),
  get('http://ign.com')
];

console.log(yield [a, b]);
```

### yield object

  Yielding an object behaves much like yielding an array, however recursion is supported:

```js
co(function *(){
  var user = yield {
    name: {
      first: get('name.first'),
      last: get('name.last')
    }
  };
})()
```

  Here is the sequential equivalent without yielding an object:

```js
co(function *(){
  var user = {
    name: {
      first: yield get('name.first'),
      last: yield get('name.last')
    }
  };
})()
```

### Performance

  On my machine 30,000 sequential stat()s takes an avg of 570ms,
  while the same number of sequential stat()s with `co()` takes
  610ms, aka the overhead introduced by generators is _extremely_ negligable.

## License

  MIT

