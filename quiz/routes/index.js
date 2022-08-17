var express = require('express');
var router = express.Router();
var connection = require('../db/db');
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var { upload } = require('./multer');
var connection = require('../db/db2');
const pool = require('../db/db2');


var options = {
  host: "15.165.221.104",
  port: "54573",
  user: "root",
  password: "11111111",
  database: "quiz",
};
var sessionStore = new MySQLStore(options);

router.use(
  session({
    secret: "encryting",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

/* GET home page. */
router.get("/", async (req, res) => {
  var indexStates = {
    quizTodayState: false,
    quizTodayCorrect: 0,
  };
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var date = year + "-" + month + "-" + day;
  //개인랭킹 sql
  const res2= await pool.query("select uid, uscore from users order by uscore desc;")
  //부대랭킹 sql
  const res3 = await pool.query("select  uunitcode, sum(uscore) as score, count(uid) from users group by uunitcode order by sum(uscore) desc;")
  if (req.session.uid) {
    try {
      if (res) {
        res.render("index", {
          indexStates: indexStates,
          title: "신박하군",
          signinState: true,
          res2: res2[0], // 개인랭킹 파라미터
          res3: res3[0] // 부대별 점수 파라미터
        });
      } else {
        indexStates.quizTodayState = true;
        indexStates.quizTodayCorrect = 5;
        res.render("index", {
          indexStates: indexStates,
          title: "신박하군2",
          signinState: true,
          res2 : res2[0],
          res3 : res3[0]
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.render("index", { 
      title: "신박하군3", 
      signinState: false,
      res2 : res2[0],
      res3 : res3[0]
    });
  }
});






router.get('/test', function (req, res, next) {
  res.render('test', { title: '테스트' });
});

router.post("/test", upload.single("img"), async (req, res) => {
  const imgfile = req.file;
  console.log(imgfile);
  res.render('test', { title: '테스트' });
});

module.exports = router;