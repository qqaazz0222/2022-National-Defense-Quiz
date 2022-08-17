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
    const user = await pool.query("insert into users values (?, ?, ?, ?, 0, null, 'user');", [
        uid,
        upw,
        uname,
        uunitcode
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
        "SELECT uunitcode, sum(uscore) as score FROM users group by uunitcode order by sum(uscore) desc;"
    );
    const members = await pool.query(
        "SELECT uunitcode, count(uunitcode) as members FROM users group by uunitcode order by count(uunitcode) desc;"
    );
    const membersrank = await pool.query(
        "SELECT uname, uscore, uunitcode FROM users order by uscore desc;"
    );
    // console.log(ranking[0]);
    // console.log(members[0]);
    return res.render("admin", {
        title: "관리자 페이지",
        udata: req.session.udata,
        signinState: req.session.isLogined,
        ranking: ranking[0],
        members: members[0],
        membersrank: membersrank[0]
    })
})

router.get("/notice", async function (req, res, next){
    const notice = await pool.query(
        "select * from notice order by ntype desc, ndate desc;"
    );
    return res.render("ap_notice", {
        title: "관리자 페이지",
        udata: req.session.udata,
        signinState: req.session.isLogined,
        notice: notice[0],
    })
})

router.get("/userpg", async function (req, res, next){
    const users = await pool.query(
        "select * from users;"
    );
    return res.render("ap_user", {
        title: "관리자 페이지",
        udata: req.session.udata,
        signinState: req.session.isLogined,
        users: users[0]
    })
})

router.post("/adminnoticesave", async function(req, res, next){
    const context = req.body.hiddentext;
    const nid = req.body.hiddennid2;
    const uname = req.session.udata.uname;
    console.log(nid);
    const savecon = await pool.query(
        "UPDATE notice SET ndesc = ?, nauthor = ? WHERE nid = ?",[
            context,
            uname,
            nid
        ]);
    return res.send("<script>alert('수정되었습니다.'); history.back();</script>");
})

router.post("/adminnoticedel", async function(req, res, next){
    const nid = req.body.hiddennid;
    const delcon = await pool.query(
        "DELETE FROM notice WHERE nid = ?",[
            nid
        ]);
    return res.send("<script>alert('삭제되었습니다.'); history.back();</script>");
})

router.post("/addadminnotice", async function(req, res, next){
    const {iorn, title, addcontext} = req.body;
    const uname = req.session.udata.uname;
    let state = 1;
    if(iorn !== 'i'){
        state = 0;
    }
    const addcon = await pool.query(
        "INSERT INTO notice VALUES (null, ?, ?, ?, ?, '2022-08-17');",[
            state,
            title,
            addcontext,
            uname
        ]);
        return res.send("<script>alert('추가되었습니다.'); history.back();</script>");
})

router.post("/adminuserdel", async function(req, res, next){
    const uid = req.body.hiddenuid;
    const adminuserdel = await pool.query(
        "DELETE FROM users WHERE uid = ?;",[
            uid
        ]);
        return res.send("<script>alert('삭제되었습니다.'); history.back();</script>");
})

router.post("/adminuseredit", async function(req, res, next){
    const uname = req.body.uname;
    const uunitcode = req.body.uunitcode;
    const uid = req.body.uid;
    const upw = req.body.upw;
    const users = await pool.query(
        "select * from users;"
    );
    for(var i = 0; i < users[0].length; i++){
        const editall = await pool.query(
            "update users set uid = ?, upw = ?, uname = ?, uunitcode = ? where uid = ?;",[
                uid[i],
                upw[i],
                uname[i],
                uunitcode[i],
                uid[i]
            ]);
        }
        return res.send("<script>alert('수정되었습니다.'); history.back();</script>");
})

module.exports = router;
