var http = require('http'),
    httpProxy = require('http-proxy'),
    util = require('util'),
    qs = require('querystring'),
    __ = require('./utils.js');

var TAABLY_PY_HOST = 'taably-py.herokuapp.com';
var TAABLY_PY_PORT = 80;

httpProxy.createServer(function (req, res, proxy) {
  var extPat = /\.[0-9a-z]+$/i;
  if (!req.url.match(extPat) && req.url.substr(-1) !== '/')
    req.url += '/'
  req.headers.host = TAABLY_PY_HOST;
  __.log(req.method + ' : ' + req.url);

  var bodyBuf = "";

  switch (req.url) {
    case '/api/v0/layout/render/':
      req.connection.setTimeout(60000);
      req.on('data', function(chunk){ bodyBuf += chunk.toString(); });
      req.on('end', function() {
        __.log('Layout data received.');
        var data = qs.parse(bodyBuf);
        __.sendLayout(res, qs.unescape(data.data), {'name': data.name});
      });
      break;
    default:
      proxy.proxyRequest(req, res, {
        host: TAABLY_PY_HOST,
        port: TAABLY_PY_PORT
      });
  }
}).listen(8080, "127.0.0.1");
__.log('Taably proxy server started');
__.log('Routing traffic to '+TAABLY_PY_HOST+':'+TAABLY_PY_PORT);
