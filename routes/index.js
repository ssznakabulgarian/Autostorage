var express = require('express');
var router = express.Router();

router.all('/', function timeLog(req, res, next) {
  console.log('Time: ' + (new Date()).toLocaleString());
  if(req.path == '/'){
    res.redirect('login.html');
  }else{
    next();
  }
})

module.exports = router;