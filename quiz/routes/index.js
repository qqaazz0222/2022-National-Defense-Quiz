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
    let miltable = {
        0 : "사령부", 100 : "100부대"
    }
    let milname = "";
    try{    
        milname = miltable[uunitcode];
    } catch(err1){
        milname = "undefined";
        throw err1;
    }

    const user = await pool.query("insert into users values (?, ?, ?, ?, 0, 'user', ?);", [
        uid,
        upw,
        uname,
        uunitcode,
        milname,
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

router.get("/test", async function (req, res, next) {
    return res.render("test", {
        title: "테스트",
        udata: req.session.udata,
        signinState: req.session.isLogined,
    });
});

router.get("/admin", async function (req, res, next){
    const ranking = await pool.query(
        "select uunitname, sum(uscore) as score from users group by uunitname order by sum(uscore) desc;"
    );
    const members = await pool.query(
        "select uunitname, count(uunitcode) as members from users group by uunitcode order by count(uunitcode) desc;"
    );
    // console.log(ranking[0]);
    console.log(members[0]);
    return res.render("admin", {
        title: "관리자 페이지",
        udata: req.session.udata,
        signinState: req.session.isLogined,
        ranking: ranking[0],
        members: members[0]
    })
})

router.get("/notice", async function (req, res, next){
    const ranking = await pool.query(
        "select uunitname, sum(uscore) as score from users group by uunitname order by sum(uscore) DESC;"
    );
    // console.log(ranking[0]);
    return res.render("ap_notice", {
        title: "관리자 페이지",
        udata: req.session.udata,
        signinState: req.session.isLogined,
        ranking: ranking[0],
    })
})

router.get("/userpg", async function (req, res, next){
    const ranking = await pool.query(
        "select uunitname, sum(uscore) as score from users group by uunitname order by sum(uscore) DESC;"
    );
    // console.log(ranking[0]);
    return res.render("ap_user", {
        title: "관리자 페이지",
        udata: req.session.udata,
        signinState: req.session.isLogined,
        ranking: ranking[0],
    })
})



module.exports = router;
