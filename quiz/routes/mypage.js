var express = require('express');
var router = express.Router();
var connection = require('../db/db');

router.get('/today', function(req, res, next) {
  var signinStates = {
  };
  if(req.session.uid) {
    res.render('quiz-today', { signinStates: signinStates,  title: '오늘의 퀴즈', signinState: true });
  } else {
    res.render('signin', { signinStates: signinStates,  title: '로그인', signinState: false });
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
