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
router.get("/", async(req,res) => {
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
  const personal_rank = await pool.query("select uid, uscore from users order by uscore desc limit 3")//니가해
  console.log(personal_rank[0])
  console.log(personal_rank[0][0].uid)


  //부대랭킹 sql
  // const unit_rank = await pool.query()// 니가해


  if (req.session.uid) {
    const res1 = await pool.query("SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
      [req.session.uid, date])
    try {
      if (res1.length == 0) {
        res.render("index", {

          indexStates: indexStates,
          title: "신박하군",
          signinState: true,
          personal_rank: personal_rank[0]// 개인랭킹 파라미터
          
          
          // unit_rank : unit_rank// 부대랭킹 파라미터
      });
      } else {
        indexStates.quizTodayState = true;
        indexStates.quizTodayCorrect = 5;
        res.render("index", {
        indexStates: indexStates,
        title: "신박하군",
        signinState: true,
                      });
      }
      
    } catch (error) {
      console.log(error);
    }
    
  } else {
    res.render("index", { title: "신박하군", signinState: false });
    
  }



    
});

// router.get("/", function (req, res, next) {
//   var indexStates = {
//       quizTodayState: false,
//       quizTodayCorrect: 0,
//   };
//   var today = new Date();
//   var year = today.getFullYear();
//   var month = today.getMonth() + 1;
//   var day = today.getDate();
//   var date = year + "-" + month + "-" + day;
//   if (req.session.uid) {
//       connection.query(
//           "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
//           [req.session.uid, date],
//           (err1, res1, fld1) => {
//               try {
//                   if (res1.length == 0) {
//                       res.render("index", {
//                           indexStates: indexStates,
//                           title: "신박하군",
//                           signinState: true,
//                       });
//                   } else {
//                       indexStates.quizTodayState = true;
//                       indexStates.quizTodayCorrect = 5;
//                       res.render("index", {
//                           indexStates: indexStates,
//                           title: "신박하군",
//                           signinState: true,
//                       });
//                   }
//               } catch (err1) {
//                   throw err1;
//               }
//           }
//       );
//   } else {
//       res.render("index", { title: "신박하군", signinState: false });
//   }
// });

router.get('/test', function (req, res, next) {
  res.render('test', { title: '테스트' });
});

router.post("/test", upload.single("img"), async (req, res) => {
  const imgfile = req.file;
  console.log(imgfile);
  res.render('test', { title: '테스트' });
});

module.exports = router;