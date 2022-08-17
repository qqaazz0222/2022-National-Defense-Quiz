
const express = require("express");
const session = require("express-session");
const router = express.Router();
const pool = require("../db/db");
const sessionStore = require("../db/session");
const { upload } = require("./multer");

router.use(
    session({
        secret: "encryting",
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
    })
);

router.get("/", async function (req, res, next) {
    const notice = await pool.query(
        "select * from notice order by nid desc limit 0,5;")
    return res.render("welcome.ejs", {
        title: "국방퀴즈",
        udata: req.session.udata,
        ndata: notice[0],
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
    return res.redirect("/mypage");
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

router.get("/quiz-rank", async function (req, res, next) {
    return res.render("quiz-rank", {
        title: "경쟁전 로비",
        udata: req.session.udata,
        signinState: req.session.isLogined,
    });
});

router.get("/ranking", async(req, res)=> {
    //개인랭킹 sql
    // const res2= await pool.query("select uid, uscore from users order by uscore desc;")
    //부대랭킹 sql
    const res3 = await pool.query("select  uunitcode, sum(uscore) as score, count(uid) as num from users group by uunitcode order by sum(uscore) desc, num desc;")
    // return res.render("rankpage");
        try {
            console.log(res3[0]);
            res.render("ranking", {
            //   res2: res2[0], // 개인랭킹 파라미터
              res3: res3[0], // 부대별 점수 파라미터
              udata: req.session.udata,
              signinState: req.session.isLogined,
              title: "부대랭킹"
            });
        } catch (error) {
          console.log(error);
        }
});
router.post("/ranking", async(req, res)=> {
    const {unitcode} = req.body;
    console.log(unitcode);
    //개인랭킹 sql
    // const res2= await pool.query("select uid, uscore from users order by uscore desc;")
    //부대랭킹 sql
    const res3 = await pool.query("select uunitcode, sum(uscore) as score, count(uid) as num from quiz.users where uunitcode = ? group by uunitcode;", [unitcode])
    // return res.render("rankpage");
        try {
            res.render("ranking", {
            //   res2: res2[0], // 개인랭킹 파라미터
              res3: res3[0], // 부대별 점수 파라미터
              udata: req.session.udata,
              signinState: req.session.isLogined,
              title: "부대랭킹"
            });
        } catch (error) {
          console.log(error);
        }
});

router.get("/test", (req, res, next) => {
    return res.render("ranking", );
});

module.exports = router;
