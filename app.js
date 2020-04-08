var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var cors = require('cors');
var Ddos = require('ddos');
var ddos = new Ddos({
  burst: 100,
  limit: 200
});

var indexRouter = require('./routes/indexRouter');
var usersRouter = require('./routes/usersRouter');
var warehouseRouter = require('./routes/warehouseRouter');

var app = express();

app.use(cors());
app.use(ddos.express);
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(helmet());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/warehouse', warehouseRouter);

app.use(express.static(path.join(__dirname, 'public')));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
});

app.get('*', function(req, res){
  res.status(404).redirect('/404.html');
});

module.exports = app;