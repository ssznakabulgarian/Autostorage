var express = require('express');
var router = express.Router();

router.all('/', function (req, res, next) {
  console.log('Time: ' + (new Date()).toLocaleString());
  next();
});

var initialHTML = '<!DOCTYPE html><html><head></head><body><script src="assets/js/suplimentary-functions.js"></script><script src="assets/js/index.js"></script></body></html>';

router.get('/', function (req, res, next) {
  if(req.path == '/'){
    res.send(initialHTML);
  }else{
    next();
  }
});

router.post('/redirect', function (req, res){
  res.redirect(req.body.page);
});

module.exports = router;