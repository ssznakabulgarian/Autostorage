var express = require('express');
var router = express.Router();

router.use('/', function timeLog(req, res, next) {
  console.log('Time: ' + (new Date()).toLocaleString());
  next();
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('public/index.html');
});

module.exports = router;