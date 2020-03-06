var express = require('express');
var router = express.Router();
var fs = require('fs');
router.all('/', function (req, res, next) {
  console.log('New connection from ' + req.connection.remoteAddress + ' at ' +(new Date()).toLocaleString());
  next();
});

router.get('/', function (req, res, next) {
  if(req.path == '/'){
    fs.readFile('./public/index.html', 'utf-8', (err, data) => {
      if (err) console.log(err);
      else res.send(''+data);
    });
  }else{
    next();
  }
});

router.post('/redirect', function (req, res){
  res.redirect(req.body.page);
});

module.exports = router;