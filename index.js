
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
  var gen = fn();
  var done;

  function next(ret) {
    if (ret.done) {
      if (done) done(null, ret.value);
      return;
    }

    if ('function' != typeof ret.value) {
      var err = new Error('yielded a non-function');
      if (done) done(err);
      else gen.throw(err);
      return;
    }

    ret.value(function(err, res){
      if (err && !done) return gen.throw(err);
      if (err) return done(err);
      next(gen.send(res));
    });
  }

  next(gen.next());

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

    if (!pending) return done();

    for (var i = 0; i < fns.length; i++) {
      run(fns[i], i);
    }

    function run(fn, i) {
      if (finished) return;
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
