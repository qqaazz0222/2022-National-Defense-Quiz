const express = require("express");
const session = require("express-session");
const router = express.Router();
const pool = require("../db/db");
const sessionStore = require("../db/session");
const { upload } = require("./multer");
const fs = require('fs');

router.use(
  session({
    secret: "encryting",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

router.get("/", function (req, res, next) {
  return res.render("welcome.ejs", {
    title: "국방퀴즈",
    udata: req.session.udata,
    signinState: req.session.isLogined,
  });
});
router.get("/mypage", function (req, res, next) {
  return res.render("mypage.ejs", {
    title: "마이페이지",
    udata: req.session.udata,
    signinState: req.session.isLogined,
  });
});
router.post("/upload", upload.single("img"), async (req, res) => {
  const imgfilename = req.file.filename;
  console.log(imgfilename);
  const imgLog = await pool.query('insert into uploads values (?, ?);', [req.session.uid, imgfilename]);
  return res.redirect("/mypage")
});
router.get("/signin", function (req, res, next) {
  if (req.session.isLogined) {
    delete req.session.uid;
    delete req.session.udata;
    delete req.session.uimg;
    delete req.session.isLogined;
    req.session.save(function () {
      res.redirect("/");
    });
  } else {
    return res.render("signin.ejs", {
      title: "로그인",
      signinState: req.session.isLogined,
    });
  }
});
router.post("/signin", async function (req, res, next) {
  const { uid, upw } = req.body;
  const user = await pool.query(
    "select * from users where uid = ? AND upw = ?;",
    [uid, upw]
  );
  if (user[0][0]) {
    req.session.uid = uid;
    req.session.udata = user[0][0];
    req.session.isLogined = true;
    req.session.save(function () {
      return res.redirect("/");
    });
  } else {
    return res.redirect("signin");
  }
});
router.get("/signup", function (req, res, next) {
  if (req.session.isLogined) {
    delete req.session.uid;
    delete req.session.udata;
    delete req.session.isLogined;
    req.session.save(function () {
      res.redirect("/");
    });
  } else {
    return res.render("signup.ejs", {
      title: "회원가입",
      signinState: req.session.isLogined,
    });
  }
});
router.post("/signup", async function (req, res, next) {
  const { uid, upw, uname, uunitcode } = req.body;
  const user = await pool.query("insert into users values (?, ?, ?, ?, 0);", [
    uid,
    upw,
    uname,
    uunitcode,
  ]);
  return res.render("signup-complete", {
    title: "회원가입 성공",
    uid: uid,
    uname: uname,
    signinState: req.session.isLogined,
  });
});
router.get("/signup-complete", function (req, res, next) {
  return res.render("signup-complete", {
    title: "회원가입성공",
    signinState: true,
  });
});

router.get("/test", async function (req, res, next) {
  return res.render("test", {
    title: "테스트",
    udata: req.session.udata,
    signinState: req.session.isLogined,
  });
});

module.exports = router;
