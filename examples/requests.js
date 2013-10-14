
var request = require('request');
var thunk = require('thunkify');
var co = require('..');
var join = co.join;

var get = thunk(request.get);

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
    console.log('%s -> %s', url, res.status);
  }
})

// parallel

co(function *(){
  var requests = urls.map(function(url){
    return get(url);
  });

  var responses = yield join(requests);

  console.log(responses.map(function(r){
    return r.status;
  }));
})
