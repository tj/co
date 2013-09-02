/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Expose `co`.
 */

exports = module.exports = co;

/**
 * Wrap the given generator `fn` with
 * optional `done` callback.
 *
 * @param {Function} fn
 * @param {Function} [done]
 * @return {Function}
 * @api public
 */

function co(fn, done, ctx) {
  var gen = isGenerator(fn) ? fn : fn.call(this);
  ctx = ctx || this;

  function next(err, res) {
    var ret;

    // multiple args
    if (arguments.length > 2) {
      res = [].slice.call(arguments, 1);
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
    next(new Error('yield a function, promise, generator, or array'));
  }

  if (done) next();
  else setImmediate(next);

  return function(fn){
    done = fn;
  }
}

/**
 * Wrap regular callback style `fn` as a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

exports.wrap = function(fn, ctx){
  return function(){
    var args = [].slice.call(arguments);
    ctx = ctx || this;
    return function(done){
      args.push(done);
      fn.apply(ctx, args);
    }
  }
};

/**
 * Join the given `fns`.
 *
 * @param {Array|Function} ...
 * @return {Function}
 * @api public
 */

exports.join = function(fns) {
  if (!Array.isArray(fns)) fns = [].slice.call(arguments);
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
};

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
  if (Array.isArray(obj)) fn = exports.join.call(ctx, obj);
  if (isGeneratorFunction(obj)) obj = obj.call(ctx);
  if (isGenerator(obj)) fn = function(done){ co(obj, done, ctx) };
  if (isPromise(obj)) fn = promiseToThunk(obj);
  return fn;
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
 * Check if `fn` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && '[object Generator]' == toString.call(obj);
}

/**
 * Check if `fn` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}
