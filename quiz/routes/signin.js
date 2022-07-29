var express = require('express');
var router = express.Router();
var connection = require("../db/db");

router.get('/', function(req, res, next) {
  res.render('signin', { uidState: true, upwState: true, valueState: true, title: '로그인', signinState: false });
});

router.post('/', function(req, res, next) {
  var { uid, upw } = req.body;
  if(uid == "") { // 아이디 입력하지 않음
    res.render('signin', { uidState: false, upwState: true, valueState: true, title: '로그인', signinState: false });
  } else if(upw == "") { // 비밀번호 입력하지 않음
    res.render('signin', { uidState: true, upwState: false, valueState: true, title: '로그인', signinState: false });
  } else if(uid == "" && upw == "") { // 아이디, 비밀번호 입력하지 않음
    res.render('signin', { uidState: false, upwState: false, valueState: true, title: '로그인', signinState: false });
  } else {
    connection.query(
      "SELECT upw FROM users WHERE uid = ?;",
      [ uid ],
      (err1, res1, fld1) => {
        try {
          if(err1) { // Mysql 에러처리

          }
          else { 
            if(res1[0].upw == upw) { // 로그인 성공시
              req.session.uid = res1[0].uid;
              req.session.signinState = res1[0].author_id;
              req.session.isLogined = true;
              req.session.save(function () {
                res.render('index', { uid: uid, upw: upw, title: '로그인 성공', signinState: true });
              });
            } else { // 비밀번호 에러
              res.render('signin', { uidState: true, upwState: true, valueState: false, title: '로그인', signinState: false });
            }
            
          }
        } catch { // Mysql 에러처리
          throw err1;
        }
      }
    )
  }
});
module.exports = router;
