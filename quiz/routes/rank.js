var express = require('express');
var router = express.Router();
var connection = require('../db/db');


router.get('/', function(req, res, next) {
  var rankStates = {

  };
  if(req.session.uid) {
    delete req.session.uid;
    delete req.session.isLogined;
    delete req.session.author_id;
    req.session.save(function () {
      res.redirect("/signin");
    });
  } else {
    res.render('signin', { rankStates: rankStates,  title: '로그인', signinState: false });
  }
});



module.exports = router;
