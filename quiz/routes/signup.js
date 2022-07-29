var express = require('express');
var router = express.Router();
var connection = require("../db/db");

router.get('/', function(req, res, next) {
  res.render('signup', { uidErrStatus: false, title: '회원가입', signinState: false });
});

router.post('/', function(req, res, next) {
  var { uid, upw, uname, uunitcode } = req.body;
  if(uid == "" || upw == "" || uname == "" || uunitcode == "") { //아이디, 비밀번호, 이름, 부대코드 중 입력값이 없을 때
    res.render(
      'signup', 
      { uidErrStatus: true, uidErrMsg: '정보를 정확히 기입해주세요.', title: '회원가입', signinState: false }
    );
  } else {
    connection.query(
      "INSERT INTO users(uid, upw, uname, uunitcode) VALUES (?, ?, ?, ?);",
      [ uid, upw, uname, uunitcode ],
      (err1, res1, fld1) => {
        try {
          if(err1) { // Mysql 에러처리
            if(err1.errno == 1062) { // 동일한 아이디 존재
              res.render(
                'signup', 
                { uidErrStatus: true, uidErrMsg: '이미 존재하는 아이디입니다.', title: '회원가입', signinState: false }
              );
            } else { // 기타 Mysql 오류 발생시
              res.send(
                "<script>alert('오류가 발생했습니다.'); location.href='/';</script>"
              );
            }
          }
          else { // 회원가입 성공시
            res.render( 
              'signup_complete', 
              { uid: uid, upw: upw, uname: uname, uunitcode: uunitcode, title: '회원가입 성공', signinState: false }
            );
          }
        } catch { // Mysql 에러처리
          throw err1;
        }
      }
    )
  }
});

module.exports = router;
