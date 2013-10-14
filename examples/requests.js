
var request = require('request');
var thunk = require('thunkify');
var co = require('..');

var get = thunk(request);

var urls = [
  'http://google.com',
  'http://yahoo.com',
  'http://cloudup.com',
  'http://ign.com'
];

// sequential

co(function *(){
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var res = yield get(url);
    console.log('%s -> %s', url, res[0].statusCode);
  }
})()

// parallel

co(function *(){
  var reqs = urls.map(function(url){
    return get(url);
  });

  var codes = (yield reqs).map(function(r){ return r.statusCode });

  console.log(codes);
})()
