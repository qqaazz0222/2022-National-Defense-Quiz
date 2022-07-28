var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '신박하군', signinStatus: false });
});

router.get('/scroll', function(req, res, next) {
  res.render('scroll', { title: '스크롤테스트' });
});

module.exports = router;
