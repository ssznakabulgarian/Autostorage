var express = require('express');
var router = express.Router();
var database = require('../database');

router.get('/', function (req, res) {
    console.log('error: no action specified');
    console.log('redirecting...');
    res.redirect('../');
})



module.exports = router;