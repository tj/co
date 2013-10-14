
var thunk = require('thunkify');
var redis = require('redis');
var db = redis.createClient();
var co = require('..');

db.set = thunk(db.set);
db.get = thunk(db.get);

co(function *(){
  yield db.set('foo', 'bar');
  yield db.set('bar', 'baz');

  var res = yield db.get('foo');
  console.log('foo -> %s', res);

  var res = yield db.get('bar');
  console.log('bar -> %s', res);
})()
