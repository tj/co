3.0.2 / 2014-01-01
==================

 * fixed: nil arguments replaced with error fn

3.0.1 / 2013-12-19
==================

 * fixed: callback passed as an argument to generators

3.0.0 / 2013-12-19
==================

 * fixed: callback passed as an argument to generators
 * change: `co(function *(){})` now returns a reusable thunk
 * change: `this` must now be passed through the returned thunk, ex. `co(function *(){}).call(this)`
 * fix "generator already finished" errors

2.3.0 / 2013-11-12
==================

 * add `yield object` support

2.2.0 / 2013-11-05
==================

 * change: make the `isGenerator()` function more generic

2.1.0 / 2013-10-21
==================

 * add passing of arguments into the generator. closes #33.

2.0.0 / 2013-10-14
==================

 * remove callback in favour of thunk-only co(). Closes #30 [breaking change]
 * remove `co.wrap()` [breaking change]

1.5.2 / 2013-09-02
==================

 * fix: preserve receiver with co.wrap()

1.5.1 / 2013-08-11
==================

 * remove setImmediate() usage - ~110% perf increase. Closes #14

0.5.0 / 2013-08-10
==================

 * add receiver propagation support
 * examples: update streams.js example to use `http.get()` and streams2 API

1.4.1 / 2013-07-01
==================

 * fix gen.next(val) for latest v8. Closes #8

1.4.0 / 2013-06-21
==================

 * add promise support to joins
 * add `yield generatorFunction` support
 * add `yield generator` support
 * add nested join support

1.3.0 / 2013-06-10
==================

 * add passing of arguments

1.2.1 / 2013-06-08
==================

 * fix join() of zero thunks

1.2.0 / 2013-06-08
==================

 * add array yielding support. great suggestion by @domenic

1.1.0 / 2013-06-06
==================

 * add promise support
 * change nextTick to setImmediate
