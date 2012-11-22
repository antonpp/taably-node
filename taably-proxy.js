var http = require('http'),
    httpProxy = require('http-proxy'),
    util = require('util'),
    qs = require('querystring'),
    fabric = require('fabric').fabric,
    __ = require('./utils.js');

var TAABLY_PY_HOST = 'taably-py.herokuapp.com';
var TAABLY_PY_PORT = 80;

httpProxy.createServer(function (req, res, proxy) {
  var extPat = /\.[0-9a-z]+$/i;
  if (!req.url.match(extPat) && req.url.substr(-1) !== '/')
    req.url += '/'
  req.headers.host = TAABLY_PY_HOST;
  req.connection.setTimeout();

  var reqBody = "";

  __.log(req.method + ' : ' + req.url);

  switch (req.url) {
    case '/api/v0/layout/render/':
      req.on('data', function(chunk){ reqBody += chunk.toString(); });
      req.on('end', function() {
        __.log('Layout data received.');
        var data = qs.parse(reqBody);
        var layoutObj = JSON.parse(qs.unescape(data.data))
        var canvas = fabric.createCanvasForNode(layoutObj.tableDesignerMeta.width, 
                                                layoutObj.tableDesignerMeta.height);
        try {
          var onContextReady = function() {
            __.log('Fabric context ready.');
            canvasStream = canvas.createPNGStream();
            res.writeHead(200, "OK", {
              'Content-Type': 'image/png',
              'Content-Disposition': 'attachment; filename="' + data.name + '.png"',
              'Set-Cookie': 'fileDownload=true; path=/'
            });
            canvasStream.on('data', function(d){res.write(d)})
            canvasStream.on('end', function(){
              __.log('Writing PNG complete.');
              res.end();
            })
          } // onContextReady
          __.log('Loading layout from json...');
          canvas.loadFromJSON(qs.unescape(data.data), onContextReady);
        } catch(err) {
          __.log("ERROR : " + err.message);
        }
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
