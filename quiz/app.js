var express = require('express');
var app = express();
var server = require('http').createServer(app);
var createError = require('http-errors');
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var usernames = {};
var pairCount = 0, id, clientsno, pgmstart=0,varCounter;
var scores = {};

server.listen(3000);

var indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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
  res.render('error', {title: "에러", signinState: true});
});

io.sockets.on('connection', function(socket){
	console.log("새로운 클라이언트 접속");
	socket.on('addClient', function(username){
		socket.username = username;
		usernames[username] = username;
		scores[socket.username] = 0;
		varCounter = 0
		pairCount++;
		if(pairCount === 1 || pairCount >=3){
			id = Math.round((Math.random() * 1000000));
			socket.room = id;
			pairCount = 1;
			console.log(pairCount + " " + id);
			socket.join(id);
			pgmstart = 1;
		} else if (pairCount === 2){
        	console.log(pairCount + " " + id);
        	socket.join(id);
        	pgmstart = 2;
    	}
		console.log(username + "님이 "+ id + "방에 접속하셨습니다.");
		socket.emit('updatechat', 'SERVER', '대결 상대를 찾는 중입니다. <br> 잠시만 기다려주세요...',id);
		socket.broadcast.to(id).emit('updatechat', 'SERVER', username + '님이 게임에 참가하셨습니다.',id);
		if(pgmstart ==2){
            // const content = await pool.query("select * from mil order by RAND() limit 4");
            console.log(content);
			fs.readFile(__dirname + "/lib/questions.json", "Utf-8", function(err, data){
				jsoncontent = JSON.parse(data);
                console.log(jsoncontent);
				io.sockets.in(id).emit('sendQuestions',jsoncontent);
			});
		} 
	});
	socket.on('result', function (usr,rst) {
        io.sockets.in(rst).emit('viewresult',usr);
	});
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.leave(socket.room);
	});
});
