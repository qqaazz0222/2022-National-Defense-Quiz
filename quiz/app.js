var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var signinRouter = require('./routes/signin');
var signupRouter = require('./routes/signup');
var quizRouter = require('./routes/quiz');
var rankRouter = require('./routes/rank');
var mypageRouter = require('./routes/mypage');

var app = express();

app.io = require('socket.io')();

app.io.on('connection',(socket) => {
  console.log('유저가 들어왔다');

  socket.on('disconnect', () => {
      console.log('유저 나갔다');
  });

  socket.on('chat', (msg) => {
    app.io.emit('chat', msg);
  });

  socket.on('quiz', (ans) => {
    app.io.emit('quiz', ans);
    console.log(ans);
  });

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/quiz', quizRouter);
app.use('/rank', rankRouter);
app.use('/mypage', mypageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
