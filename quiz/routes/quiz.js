var express = require('express');
var router = express.Router();
var connection = require('../db/db');

router.get('/today', function(req, res, next) {
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
            req.session.qid = [0,0,0,0,0];
            req.session.aid = [0,0,0,0,0];
            res.redirect('today/1');
          } else {
            res.send(
              "<script>location.href='/'; alert('이미 오늘의 퀴즈를 푸셨습니다..');</script>"
            );
          }
        } catch (err1) {
          throw err1;
        }
      }
    );
    
  } else {
    
    res.render('signin', { quizStates: quizStates,  title: '로그인', signinState: false });
  }
});

router.get('/today/:id', function(req, res, next) {
  var quizStates = {
    qid: parseInt(req.params.id),
  };
  if(req.session.uid) {
    res.render('quiz-today', { quizStates: quizStates,  title: '오늘의 퀴즈', signinState: true });
  } else {
    res.render('signin', { quizStates: quizStates,  title: '로그인', signinState: false });
  }
});

router.post('/today/:id', function(req, res, next) {
  req.session.qid[req.params.id-1] = req.params.id;
  req.session.aid[req.params.id-1] = req.body.quiz;
  if(req.params.id == 5) {
    res.redirect('/quiz/today-complete');
  } else {
    res.redirect('/quiz/today/'+(parseInt(req.params.id)+1));
  }
});

router.get('/today-complete', function(req, res, next) {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var date = year + "-" + month + "-" + day;
  var uid = req.session.uid;
  var qid = req.session.qid;
  var aid = req.session.aid;
  if(req.session.uid) {
    connection.query(
      "INSERT INTO resqt VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [ uid, date, qid[0], aid[0], qid[1], aid[1], qid[2], aid[2], qid[3], aid[3], qid[4], aid[4] ],
      (err1, res1, fld1) => {
        try {
          res.render('quiz-today-complete', { title: '오늘의 퀴즈 완료', signinState: true });
        } catch(err1) {
          throw err1;
        }
      }
    );
  } else {
    res.redirect('/signin');
  }
});

router.get('/battle', function(req, res, next) {
  var signinStates = {
  };
  if(req.session.uid) {
    res.render('quiz-battle', { signinStates: signinStates,  title: '오늘의 퀴즈', signinState: true });
  } else {
    res.render('signin', { signinStates: signinStates,  title: '로그인', signinState: false });
  }
});

module.exports = router;
