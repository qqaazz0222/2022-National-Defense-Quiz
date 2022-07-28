var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('signin', { title: '로그인', signinStatus: false });
});

router.post('/', function(req, res, next) {
  var { uid, upw } = req.body;
  console.log(uid, upw);
  res.render('index', { uid: uid, upw: upw, title: '로그인 성공', signinStatus: true });
});

module.exports = router;
