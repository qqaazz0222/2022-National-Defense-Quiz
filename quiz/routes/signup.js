var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('signup', { title: '회원가입', signinStatus: false });
});

router.post('/', function(req, res, next) {
  var { uid, upw, uname, uunitcode } = req.body;

  console.log(uid, upw, uname, uunitcode);
  res.render('signup_complete', { uid: uid, upw: upw, uname: uname, uunitcode: uunitcode, title: '회원가입 성공', signinStatus: false });
});

module.exports = router;
