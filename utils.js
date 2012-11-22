var log = function(what) {
  d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(d + ' > ' + what);
}
module.exports.log = log
