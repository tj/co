
/**
 * toString() reference.
 */

var toString = Object.prototype.toString;

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co;

/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var ctx = this;
  var done;
  var gen;

  function next(err, res) {
    var ret;

    // multiple args
    if (arguments.length > 2) {
      res = slice.call(arguments, 1);
    }

    // error
    if (err) {
      try {
        ret = gen.throw(err);
      } catch (e) {
        if (!done) throw e;
        return done(e);
      }
    }

    // ok
    if (!err) {
      try {
        ret = gen.next(res);
      } catch (e) {
        if (!done) throw e;
        return done(e);
      }
    }

    // done
    if (ret.done) {
      if (done) done(null, ret.value);
      return;
    }

    // normalize
    ret.value = toThunk(ret.value, ctx);

    // run
    if ('function' == typeof ret.value) {
      try {
        ret.value.call(ctx, next);
      } catch (e) {
        setImmediate(function(){
          next(e);
        });
      }
      return;
    }

    // invalid
    next(new Error('yield a function, promise, generator, array, or object'));
  }

  return function(){
    var args = slice.call(arguments);
    done = args.pop();
    gen = isGenerator(fn) ? fn : fn.apply(ctx, args);
    next();
  }
}

/**
 * Convert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api private
 */

function toThunk(obj, ctx) {
  var fn = obj;
  if (Array.isArray(obj)) fn = arrayToThunk.call(ctx, obj);
  if ('[object Object]' == toString.call(obj)) fn = objectToThunk.call(ctx, obj);
  if (isGeneratorFunction(obj)) obj = obj.call(ctx);
  if (isGenerator(obj)) fn = co.call(ctx, obj);
  if (isPromise(obj)) fn = promiseToThunk(obj);
  return fn;
}

/**
 * Convert an array of yieldables to a thunk.
 *
 * @param {Array}
 * @return {Function}
 * @api private
 */

function arrayToThunk(fns) {
  var ctx = this;

  return function(done){
    var pending = fns.length;
    var results = new Array(pending);
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results);
      });
      return;
    }

    for (var i = 0; i < fns.length; i++) {
      run(fns[i], i);
    }

    function run(fn, i) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[i] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Convert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj){
  var ctx = this;

  return function(done){
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = {};
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results)
      });
      return;
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}
