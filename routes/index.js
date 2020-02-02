var express = require('express');
var router = express.Router();

router.all('/', function (req, res, next) {
  console.log('Time: ' + (new Date()).toLocaleString());
  next();
});

router.get('/', function (req, res, next) {
  if(req.path == '/'){
    res.redirect('login.html');
  }else{
    next();
  }
});

router.post('/redirect', function (req, res){
  res.redirect(req.body.page);
});

module.exports = router;