var express = require('express');
var router = express.Router();
var connection = require('../db/db');

router.get('/', function(req, res, next) {
  var signinStates = {
    uidState: true,
    upwState: true,
    valueState: true,
    valueMsg: "",
    returnUid: "아이디를 입력하세요.",
    returnUpw: "비밀번호를 입력하세요." 
  };
  if(req.session.uid) {
    delete req.session.uid;
    delete req.session.isLogined;
    delete req.session.author_id;
    req.session.save(function () {
      res.redirect("/signin");
    });
  } else {
    res.render('signin', { signinStates: signinStates,  title: '로그인', signinState: false });
  }
});

router.post('/', function(req, res, next) {
  var signinStates = {
    uidState: true,
    upwState: true,
    valueState: true,
    valueMsg: "",
    returnUid: "아이디를 입력하세요.",
    returnUpw: "비밀번호를 입력하세요." 
  };
  var { uid, upw } = req.body;
  if(uid == "" && upw == "") { // 아이디, 비밀번호 입력하지 않음
    signinStates.uidState = false;
    signinStates.upwState = false;
    res.render('signin', { signinStates: signinStates, title: '로그인', signinState: false });
  } else if(upw == "") { // 비밀번호 입력하지 않음
    signinStates.upwState = false;
    res.render('signin', { signinStates: signinStates, title: '로그인', signinState: false });
  } else if(uid == "") { // 아이디 입력하지 않음
    signinStates.uidState = false;
    res.render('signin', { signinStates: signinStates, title: '로그인', signinState: false });
  } else {
    connection.query(
      "SELECT * FROM users WHERE uid = ?;",
      [ uid ],
      (err1, res1, fld1) => {
        if(res1.length == 0) { // 아이디 없음
          signinStates.uidState = false;
          signinStates.valueState = false;
          signinStates.returnUid = "아이디가 없습니다.",
          res.render('signin', { signinStates: signinStates, title: '로그인', signinState: false });
        } else {
          try {
            if(err1) { // Mysql 에러처리
              
            }
            else { 
              if(res1[0].upw == upw) { // 로그인 성공시
                req.session.uid = res1[0].uid;
                req.session.signinState = res1[0].author_id;
                req.session.isLogined = true;
                req.session.save(function () {
                  res.redirect('../');
                });
              } else { // 비밀번호 에러
                signinStates.upwState = false;
                signinStates.returnUpw = "잘못된 비밀번호입니다.",
                res.render('signin', { signinStates: signinStates, title: '로그인', signinState: false });
              }
            }
          } catch (err1) { // Mysql 에러처리
            throw err1;
          }
        }
      }
    )
  }
});
module.exports = router;
