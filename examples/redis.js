
var co = require('..');
var redis = require('redis');
var db = redis.createClient();

db.set = co.wrap(db.set, db);
db.get = co.wrap(db.get, db);

co(function *(){
  yield db.set('foo', 'bar');
  yield db.set('bar', 'baz');

  var res = yield db.get('foo');
  console.log('foo -> %s', res);

  var res = yield db.get('bar');
  console.log('bar -> %s', res);
})
