
var thunk = require('thunkify');
var co = require('..');
var fs = require('fs');
var read = thunk(fs.readFile);
var assert = require('assert');

var ctx = {
  foo: 'bar'
};

describe('co.call(receiver)', function(){
  it('should set immediate gen receiver', function(done){
    co.call(ctx, function *(){
      assert(ctx == this);
      done();
    });
  })

  it('should set delegate generator receiver', function(done){
    function *bar() {
      assert(ctx == this);
    }

    function *foo() {
      assert(ctx == this);
      yield bar;
    }

    co.call(ctx, function *(){
      assert(ctx == this);
      yield foo;
      done();
    });
  })

  it('should set function receiver', function(done){
    function foo(done) {
      assert(this == ctx);
      done();
    }

    co.call(ctx, function *(){
      assert(ctx == this);
      yield foo;
      done();
    });
  })

  it('should set join delegate generator receiver', function(done){
    function *baz() {
      assert(ctx == this);
    }

    function *bar() {
      assert(ctx == this);
    }

    function *foo() {
      assert(ctx == this);
    }

    co.call(ctx, function *(){
      assert(ctx == this);
      yield [foo, bar, baz];
      done();
    });
  })

  it('should set join function receiver', function(done){
    function baz(done) {
      assert(ctx == this);
      done();
    }

    function bar(done) {
      assert(ctx == this);
      done();
    }

    function foo(done) {
      assert(ctx == this);
      done();
    }

    co.call(ctx, function *(){
      assert(ctx == this);
      yield [foo, bar, baz];
      done();
    });
  })
})
