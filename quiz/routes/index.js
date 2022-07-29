var express = require('express');
var router = express.Router();
const { upload } = require('./multer');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: '신박하군', signinState: false });
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