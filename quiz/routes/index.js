var express = require('express');
var router = express.Router();
var connection = require('../db/db');
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var { upload } = require('./multer');
var options = {
  host: "localhost",
  port: 3306,
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
router.get('/', function (req, res, next) {
  var indexStates = {
    quizTodayState: false,
    quizTodayCorrect: 0
  }
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var date = year + "-" + month + "-" + day;
  if(req.session.uid) {
    connection.query(
      "SELECT date FROM resqt WHERE uid = ? AND date = ?;",
      [ req.session.uid, date ],
      (err1, res1, fld1) => {
        try {
          if(res1.length == 0) {
            res.render('index', { indexStates: indexStates, title: '신박하군', signinState: true });
          } else {
            indexStates.quizTodayState = true;
            indexStates.quizTodayCorrect = 5;
            res.render('index', { indexStates: indexStates, title: '신박하군', signinState: true });
          }
        } catch (err1) {
          throw err1;
        }
      }
    );
  } else {
    res.render('index', { title: '신박하군', signinState: false });
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