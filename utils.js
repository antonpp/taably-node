var fabric = require('fabric').fabric;

var log = function(what) {
  d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(d + ' > ' + what);
}

var setBackgroundGrad = function(ctx, data) {
  var c1 = data.color1;
  var c2 = data.color2;
  var bgRect = new fabric.Rect({
    left: ctx.getCenter().left, 
    top: ctx.getCenter().top, 
    width: ctx.width, 
    height: ctx.height
  });
  var grad = ctx.getContext().createLinearGradient(0,0,0,ctx.height/3);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  bgRect.fill = grad;
  ctx.insertAt(bgRect,1);
} // setBackgroundGrad

var setBackgroundRad = function(ctx, data) {
  ctx.backgroundColor = c1;
  var bgRad = new fabric.Rect({
    left: ctx.getCenter().left, 
    top: ctx.getCenter().top, 
    width: ctx.width, 
    height: ctx.height
  });
  var c1 = data.color1;
  var c2 = data.color2;
  var grad = ctx.getContext().createRadialGradient(0, 0, 0, 0, 0, ctx.height/2);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  bgRad.set('scaleY',0.8);
  bgRad.set('scaleX',2.0);
  bgRad.fill = grad;
  ctx.insertAt(bgRad,2);
} // setBackgroundRad

var sendLayout = function(res, jsonStr, opt) {
  var layoutObj = JSON.parse(jsonStr)
  var canvas = fabric.createCanvasForNode(
      layoutObj.tableDesignerMeta.width, 
      layoutObj.tableDesignerMeta.height
  );
  var onContextReady = function() {
    log('Fabric context ready.');

    var bgData = layoutObj.tableDesignerMeta.bgData;
    switch (bgData.type) {
      case 'gradient':
        setBackgroundGrad(canvas, bgData.options);
        break;
      case 'radient':
        setBackgroundRad(canvas, bgData.options);
        break;
      default:
    }

    canvasStream = canvas.createPNGStream();
    res.writeHead(200, "OK", {
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="'
        +opt.name+'.png"',
      'Set-Cookie': 'fileDownload=true; path=/'
    });
    canvasStream.on('data', function(d){res.write(d)})
    canvasStream.on('end', function(){
      log('Writing PNG complete.');
      res.end();
    })
  } // onContextReady
  log('Loading layout from json...');
  canvas.loadFromJSON(jsonStr, onContextReady);
}

module.exports.log = log
module.exports.sendLayout = sendLayout
