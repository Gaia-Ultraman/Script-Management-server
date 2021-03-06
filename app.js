var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//路由导入
var LogRouter = require("./routes/log.js")
var DataBaseRouter = require("./routes/dataBase.js")

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//允许跨域
app.use(function(req, res, next) {
  res.append("Access-Control-Allow-Origin", "*")
  next()
})
//路由配置
app.use("/api",LogRouter)
app.use("/api",DataBaseRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send('404 Not Found! 请检查URL是否填写正确！')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
