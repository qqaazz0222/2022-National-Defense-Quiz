var express = require("express");
var app = express();
var server = require("http").createServer(app);
var createError = require("http-errors");
var io = require("socket.io")(server);
const pool = require("./db/db");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");

var usernames = {};
var pairCount = 0,
    id,
    clientsno,
    pgmstart = 0,
    varCounter;
var scores = {};

server.listen(3000);

var indexRouter = require("./routes/index");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error", { title: "에러", signinState: true });
});

io.sockets.on("connection", (socket) => {
    console.log("[Socket.io] 새로운 클라이언트 접속...");
    socket.on("addClient", async (username) => {
        socket.username = username;
        usernames[username] = username;
        scores[socket.username] = 0;
        varCounter = 0;
        pairCount++;
        if (pairCount === 1 || pairCount >= 3) {
            id = Math.round(Math.random() * 1000000);
            socket.room = id;
            pairCount = 1;
            socket.join(id);
            pgmstart = 1;
        } else if (pairCount === 2) {
            socket.join(id);
            pgmstart = 2;
        }
        console.log("[Socket.io] "+ username + "님이 " + id + "방에 접속하셨습니다.");
        socket.emit(
            "updatechat",
            "SERVER",
            "대결 상대를 찾는 중입니다. <br> 잠시만 기다려주세요...",
            id
        );
        socket.broadcast
            .to(id)
            .emit(
                "updatechat",
                "SERVER",
                username + "님이 게임에 참가하셨습니다.",
                id
            );
        if (pgmstart == 2) {
            const qIndex = await pool.query("SELECT * FROM `quiz-rank` ORDER BY RAND() LIMIT 10;");
            let content = {"questions":[]}
            for(let i=0; i<10; i++) {
                let question = qIndex[0][i].question;
                let {choices1, choices2, choices3} = qIndex[0][i];
                let num = parseInt(Math.random()*4);
                let qData = await pool.query("SELECT title, exp FROM mil2 WHERE rowno IN (?, ?, ?, ?)",[question, choices1, choices2, choices3]);
                let choices = [qData[0][1].title.split('(')[0], qData[0][2].title.split('(')[0], qData[0][3].title.split('(')[0]];
                choices.splice(num, 0, qData[0][0].title.split('(')[0]);
                let data = {"question": qData[0][0].exp.split('.')[0]+".", "choices": choices, "correctAnswer":num};
                content.questions.push(data);
            }
            console.log("[Socket.io] 퀴즈 로딩 성공...");
            io.sockets.in(id).emit("sendQuestions", content);
        }
    });
    socket.on("result", (usr, rst) => {
        console.log("[Socket.io] 결과 : "+ usr +"/"+ rst);
        io.sockets.in(rst).emit("viewresult", usr);
    });
    socket.on("addPoint", async (usr, pnt) => {
        console.log("[Socket.io] 점수 추가...");
        console.log("[Socket.io] 처리 : "+ usr +" / +"+ pnt);
        const updatePoint = await pool.query("UPDATE users SET uscore=(uscore + ?) WHERE uid = ?;", [pnt, usr]);
    });
    socket.on("disconnect", () => {
        console.log("[Socket.io] 클라이언트(" + usernames[socket.username] + ") 접속 종료...");
        delete usernames[socket.username];
        io.sockets.emit("updateusers", usernames);
        socket.leave(socket.room);
    });
});
