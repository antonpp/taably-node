var fabric = require('fabric').fabric,
    Canvas = require('canvas'),
    fs = require('fs');

var log = function(what) {
  d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(d + ' > ' + what);
}

var overlayImg = function(_canvas, imgSrc, callback) {
  fs.readFile(imgSrc, function(err, data) {
    if (err) throw err;
    var img = new Canvas.Image;
    img.onload = function() {
      _canvas.getContext('2d').drawImage(img, 0, 0);
      if (typeof callback === 'function')
        callback.call(img);
    }
    img.src = data;
  })
}

var setBackgroundGrad = function(ctx, data) {
  // this function is a hack to make it work on older
  // versions of canvas and fabric
  var c1 = data.color1;
  var c2 = data.color2;
  var grad = ctx.getContext().createLinearGradient(0,0,0,ctx.height);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  var bgRect = new fabric.Rect({
    fill: grad,
    left: ctx.getCenter().left, 
    top: 0, 
    width: ctx.width, 
    height: ctx.height*2
  });
  ctx.insertAt(bgRect,1);
} // setBackgroundGrad

var setBackgroundRad = function(ctx, data) {
  // this function is a hack to make it work on older
  // versions of canvas and fabric
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

    log("Rendering for : " + opt.room);
    
    var overlayDone = function() {
      //var canvasStream = canvas.nodeCanvas.createPNGStream();
      var canvasStream = canvas.nodeCanvas.createJPEGStream({quality: 80});

      res.writeHead(200, "OK", {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="'
          +opt.name+'.jpg"',
        'Set-Cookie': 'fileDownload=true; path=/'
      });
      canvasStream.on('data', function(d){res.write(d)})
      canvasStream.on('end', function(){
        log('Writing JPG complete.');
        res.end();
      });
    }

    try {
      overlayImg(canvas, __dirname+'/'+opt.room+'_overlay.png', overlayDone);
    } catch(err) {
      console.log("Error overlaying image");
      overlayDone();
    }
  } // onContextReady
  log('Loading layout from json...');
  canvas.loadFromJSON(jsonStr, onContextReady);
}

module.exports.log = log
module.exports.sendLayout = sendLayout
