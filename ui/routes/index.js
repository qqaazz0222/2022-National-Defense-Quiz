var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("welcome", { title: "welcome" });
});

router.get("/home", function (req, res, next) {
  res.render("home", { title: "home" });
});

router.get("/quiz-today", function (req, res, next) {
  res.render("quiz-today", { title: "quiz-today" });
});

router.get("/quiz-rank", function (req, res, next) {
  res.render("quiz-rank", { title: "quiz-rank" });
});

router.get("/ranking", function (req, res, next) {
  res.render("ranking", { title: "ranking" });
});

router.get("/mypage", function (req, res, next) {
  res.render("mypage", { title: "mypage" });
});

router.get("/signin", function (req, res, next) {
  res.render("signin", { title: "signin" });
});

router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "signup" });
});

module.exports = router;
