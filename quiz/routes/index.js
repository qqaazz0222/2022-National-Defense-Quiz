const express = require("express");
const session = require("express-session");
const router = express.Router();
const pool = require("../db/db");
const sessionStore = require("../db/session");
const { upload } = require("./multer");

// 세션 보안
router.use(
    session({
        secret: "encryting",
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
    })
);
// 메인페이지
router.get("/", async function (req, res, next) {
    const notice = await pool.query("select * from notice order by nid desc limit 0,5;")
    try {
        return res.render("welcome.ejs", {
            title: "국방퀴즈",
            udata: req.session.udata,
            ndata: notice[0],
            signinState: req.session.isLogined,
        });
    } catch (error) {
        return res.render('error');
        throw error;
    }
});
// 마이페이지
router.get("/mypage", function (req, res, next) {
    try {
        if(req.session.uid) {
            return res.render("mypage.ejs", {
            title: "마이페이지",
                udata: req.session.udata,
                signinState: req.session.isLogined,
            });
        } else {
            return res.redirect('/signin');
        }
    } catch (error) {
        return res.render('error');
        throw error;
    }
});
// 마이페이지 > 이미지 업로드
router.post("/upload", upload.single("img"), async (req, res) => {
    try {
        return res.redirect("/mypage");
    } catch (error) {
        return res.render('error');
        throw error;
    }
});
// 로그인페이지
router.get("/signin", function (req, res, next) {
    try {
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
    } catch (error) {
        return res.render('error');
        throw error;
    }
});
// 로그인페이지 요청
router.post("/signin", async function (req, res, next) {
    const { uid, upw } = req.body;
    const user = await pool.query("select * from users where uid = ? AND upw = ?;",[uid, upw]);
    try { 
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
    } catch (error) {
        return res.render('error');
        throw error;
    }
});
// 회원가입페이지
router.get("/signup", function (req, res, next) {
    try {
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
    } catch (error) {
        return res.render('error');
        throw error;
    }
});
// 회원가입페이지 요청
router.post("/signup", async function (req, res, next) {
    const { uid, upw, uname, uunitcode } = req.body;
    try {
        const user = await pool.query("insert into users values (?, ?, ?, ?, 0, 'user');", [uid, upw, uname, uunitcode,]);
    return res.render("signup-complete", {
        title: "회원가입 성공",
        uid: uid,
        uname: uname,
        signinState: req.session.isLogined,
    });
    } catch (error) {
        return res.render('error');
        throw error;
    }
});
// 부대랭킹페이지
router.get("/ranking", async(req, res)=> {
    // 개인랭킹 SQL
    // const rankUser = await pool.query("select uid, uscore from users order by uscore desc;")
    // 부대랭킹 SQL
    const rankUnit = await pool.query("select  uunitcode, sum(uscore) as score, count(uid) as num from users group by uunitcode order by sum(uscore) desc, num desc;")
    try {
        console.log(res3[0]);
        res.render("ranking", {
        //   res2: rankUser[0], // 개인랭킹 파라미터
            res3: rankUnit[0], // 부대별 점수 파라미터
            udata: req.session.udata,
            signinState: req.session.isLogined,
            title: "부대랭킹"
        });
    } catch (error) {
        console.log(error);
    }
});
// 부대랭킹페이지 검색요청
router.post("/ranking", async(req, res)=> {
    const {unitcode} = req.body;
    console.log(unitcode);
    // 개인랭킹 SQL
    // const rankUser = await pool.query("select uid, uscore from users order by uscore desc;")
    // 부대랭킹 SQL
    const rankUnit = await pool.query("select uunitcode, sum(uscore) as score, count(uid) as num from quiz.users where uunitcode = ? group by uunitcode;", [unitcode])
    // return res.render("rankpage");
        try {
            res.render("ranking", {
            //   res2: rankUser[0], // 개인랭킹 파라미터
              res3: rankUnit[0], // 부대별 점수 파라미터
              udata: req.session.udata,
              signinState: req.session.isLogined,
              title: "부대랭킹"
            });
        } catch (error) {
          console.log(error);
        }
});

router.get("/quiz-today", async (req, res) => {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let date = year + "-" + month + "-" + day;
    try {
        const que_ans = await pool.query("SELECT * from quiz.quiz_today where date= ?", [date])
        // quiz_today에서 [question, answer] 정보 조회
        // 정보 > 문제 제목, 정답 받음
        if (req.session.uid) {
            const res1 = await pool.query("SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",[req.session.uid, date]);
            if (res1[0].length == 0) {
                req.session.qid = [0, 0, 0, 0]; // 문제 생성 (4)
                req.session.aid = [0, 0, 0, 0]; // 답 생성 (4)
                req.session.qid[0] = que_ans[0][0].q1
                req.session.qid[1] = que_ans[0][0].q2
                req.session.qid[2] = que_ans[0][0].q3
                req.session.qid[3] = que_ans[0][0].q4
                res.redirect("today/1");
            } else {
                res.send("<script>location.href='/'; alert('이미 오늘의 퀴즈를 푸셨습니다..');</script>");
            }
        } else {
            res.redirect('/signin');
        }
    } catch (error) {
        return res.redirect('error')
    }

});

router.get("/quiz-today/:id", async (req, res) => {
    try {
        let today = new Date();
        let year = today.getFullYear();
        let month = "0" + (today.getMonth() + 1)
        let day = today.getDate();
        let date = year + "-" + month + "-" + day;
        console.log(req.session.qid);
        let quizStates = {
            qid: parseInt(req.params.id),
        };
        const problem_number = req.session.qid[parseInt(req.params.id) - 1]
        // 세션의 정보를 불러와서 정보 조회
        const correct_problem = await pool.query('select * from mil where rowno= ?', [problem_number])
        // 문제와 정답 출력
        const rowno = correct_problem[0][0].rowno
        const type = correct_problem[0][0].type
        // 나머지 정답 출력 
        const incorrect_problem = await pool.query('select exp from mil where rowno!= ? and type = ? limit  4', [rowno, type])
        console.log(incorrect_problem[0][0].exp);
        // ques, answr값 불러와서 정보 조회
        const quiz_today = await pool.query('select * from quiz_today where date = ?', [date]);
        let ans = []
        ans.push(quiz_today[0][0].a1)
        ans.push(quiz_today[0][0].a2)
        ans.push(quiz_today[0][0].a3)
        ans.push(quiz_today[0][0].a4)
        if (req.session.uid) {
            res.render("quiz-today", {
                req: req.session.qid,
                correct_problem: correct_problem[0][0],
                incorrect_problem: incorrect_problem[0],
                quiz_today: quiz_today[0][0],
                quizStates: quizStates,
                ans: ans,
                title: "오늘의 퀴즈",
                signinState: true,
            });
        } else {
            res.redirect('/signin');
        }
    } catch (error) {
        return res.redirect('error');
    }
});
    
router.post("/quiz-today/:id", async (req, res) => {
    try {
        req.session.aid[req.params.id - 1] = req.body.quiz;
        if (req.params.id == 4) {
            res.redirect("/quiz-today-complete");
        } else {
            res.redirect("/quiz-today/" + (parseInt(req.params.id) + 1));
        }
    } catch (error) {
        return res.redirect('error');
    }
});

router.get("/quiz-today-complete", async (req, res) => {
    try {
    let indexStates = {
        quizTodayState: false,
        quizTodayCorrect: 0,
    };
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let date = year + "-" + month + "-" + day;
    let uid = req.session.uid;
    let qid = req.session.qid; // 문제 번호
    let aid = req.session.aid; // 사용자 답

    if (req.session.uid) {
        const user_res = await pool.query("INSERT INTO res_quiz_today VALUES (null, ?, ?, ?, ?, ?, ? );",[uid, date, aid[0], aid[1], aid[2], aid[3]]);
        const answer = await pool.query("select a1, a2, a3, a4 from quiz_today where date = ? ", [date])
        const user_response = await pool.query("select r1, r2, r3, r4 from res_quiz_today where date = ? and uid = ?", [date, req.session.uid])

        let answer2 = []
        let user_response2 = []

        answer2.push(answer[0][0].a1);
        answer2.push(answer[0][0].a2);
        answer2.push(answer[0][0].a3);
        answer2.push(answer[0][0].a4);

        user_response2.push(parseInt(user_response[0][0].r1))
        user_response2.push(parseInt(user_response[0][0].r2))
        user_response2.push(parseInt(user_response[0][0].r3))
        user_response2.push(parseInt(user_response[0][0].r4))

        cnt = 0
        for (i = 0; i < 4; i++) {
            if (answer2[i] == user_response2[i]) {
                cnt += 1
            }
        }
        indexStates.quizTodayCorrect = cnt

        res.render("quiz-today-complete", {
            title: "오늘의 퀴즈 완료",
            signinState: true,
            indexStates: indexStates
        });
    } else {
        res.redirect("/signin");
    }
    } catch (error) {
        return res.redirect('error');
    }
});

// 경쟁전페이지
router.get("/quiz-rank", async function (req, res, next) {
    if(req.session.uid) {
        return res.render("quiz-rank", {
            title: "경쟁전 로비",
            udata: req.session.udata,
            signinState: req.session.isLogined,
        });
    } else {
        return res.redirect('/signin')
    }
});

module.exports = router;
