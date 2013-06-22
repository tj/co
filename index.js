
/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Expose `co`.
 */

exports = module.exports = co;

/**
 * Wrap the given generator `fn`.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var args = [].slice.call(arguments, 1);
  var gen = isGenerator(fn) ? fn : fn.apply(this, args);
  var done;

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
        ret = gen.send(res);
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

    // array (join)
    if (Array.isArray(ret.value)) {
      ret.value = exports.join(ret.value);
    }

    // generator function
    if (isGeneratorFunction(ret.value)) {
      ret.value = ret.value();
    }

    // generator
    if (isGenerator(ret.value)) {
      ret.value = co(ret.value);
    }

    // thunk
    if ('function' == typeof ret.value) {
      try {
        ret.value(next);
      } catch (e) {
        setImmediate(function(){
          next(e);
        });
      }
      return;
    }

    // promise
    if (ret.value && 'function' == typeof ret.value.then) {
      ret.value.then(function(value) {
        next(null, value);
      }, next);

      return;
    }

    // neither
    next(new Error('yield a function, promise, generator, or array'));
  }

  setImmediate(next);

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
    return function(done){
      args.push(done);
      fn.apply(ctx || this, args);
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

      if (Array.isArray(fn)) {
        fn = exports.join(fn);
      }

      if (isGeneratorFunction(fn)) {
        fn = fn();
      }

      if (isGenerator(fn)) {
        fn = co(fn);
      }

      try {
        fn(function(err, res){
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
 * Check if `fn` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return '[object Generator]' == toString.call(obj);
}

/**
 * Check if `fn` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj.constructor && obj.constructor.name == 'GeneratorFunction';
}
