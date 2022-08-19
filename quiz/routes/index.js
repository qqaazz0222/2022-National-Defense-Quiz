const express = require("express");
const session = require("express-session");
const router = express.Router();
const pool = require("../db/db");
const sessionStore = require("../db/session");
const { upload } = require("./multer");

// 세션 보안
router.use(
    session({
        secret: "gukbangquiz",
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
    })
);

// 메인페이지
router.get("/", async function (req, res, next) {
    try {
        let notice = await pool.query("select * from notice order by nid desc limit 5;")
        return res.render("welcome.ejs", {
            title: "국방퀴즈",
            udata: req.session.udata,
            ndata: notice[0],
            signinState: req.session.isLogined,
        });
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
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
    }
});

// 마이페이지 > 이미지 업로드
router.post("/upload", upload.single("img"), async (req, res) => {
    try {
        return res.redirect("/mypage");
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 로그인페이지
router.get("/signin", function (req, res, next) {
    try {
        // 로그인 여부 판단
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
                errorData: {
                    id : "", 
                    msg: ""
                },
                signinState: req.session.isLogined
            });
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 로그인페이지 요청
router.post("/signin", async function (req, res, next) {
    try { 
        const { uid, upw } = req.body;
        if(uid == "") { // 아이디 공백 확인
            return res.render("signin.ejs", {
                title: "로그인",
                errorData: {
                    id : "inputIdErr", 
                    msg: "아이디를 입력해주세요."
                },
                signinState: req.session.isLogined
            });
        } else if(upw == ""){ // 비밀번호 공백 확인
            return res.render("signin.ejs", {
                title: "로그인",
                errorData: {
                    id : "inputPwErr", 
                    msg: "비밀번호를 입력해주세요."
                },
                signinState: req.session.isLogined
            });
        } else {
            const user = await pool.query("select * from users where uid = ?;",[uid, upw]);
            if (user[0][0]) {  // 아이디 존재 확인
                if(user[0][0].upw == upw) { // 비밀번호 확인
                    req.session.uid = uid;
                    req.session.udata = user[0][0];
                    req.session.isLogined = true;
                    req.session.save(function () {
                        return res.redirect("/");
                    });
                } else {
                    return res.render("signin.ejs", {
                        title: "로그인",
                        errorData: {
                            id : "pwErr", 
                            msg: "잘못된 비밀번호입니다."
                        },
                        signinState: req.session.isLogined
                    });
                }
            } else {
                return res.render("signin.ejs", {
                    title: "로그인",
                    errorData: {
                        id : "idErr", 
                        msg: "해당되는 아이디가 없습니다."
                    },
                    signinState: req.session.isLogined
                });
            }
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 회원가입페이지
router.get("/signup", function (req, res, next) {
    try {
        if (req.session.isLogined) { // 로그인 여부 판단
            delete req.session.uid;
            delete req.session.udata;
            delete req.session.isLogined;
            req.session.save(function () {
                res.redirect("/");
            });
        } else {
            return res.render("signup.ejs", {
                title: "회원가입",
                errorData: {
                    id : "", 
                    msg: ""
                },
                signinState: req.session.isLogined,
            });
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 회원가입페이지 요청
router.post("/signup", async function (req, res, next) {
    try {
        const { uid, upw, uname, uunitcode } = req.body;
        if(!uid){ // 아이디 입력 확인
            return res.render("signup.ejs", {
                title: "회원가입",
                errorData: {
                    id : "inputIdErr", 
                    msg: "아이디를 입력해주세요."
                },
                signinState: req.session.isLogined,
            });
        } else if(!upw){ // 비밀번호 입력 확인
            return res.render("signup.ejs", {
                title: "회원가입",
                errorData: {
                    id : "inputPwErr", 
                    msg: "비밀번호를 입력해주세요."
                },
                signinState: req.session.isLogined,
            });
        } else if(!uname){ // 이름 입력 확인
            return res.render("signup.ejs", {
                title: "회원가입",
                errorData: {
                    id : "inputNameErr", 
                    msg: "이름을 입력해주세요."
                },
                signinState: req.session.isLogined,
            });
        } else if(!uunitcode){ // 부대코드 입력 확인
            return res.render("signup.ejs", {
                title: "회원가입",
                errorData: {
                    id : "inputUnitCodeErr", 
                    msg: "부대코드를 입력해주세요."
                },
                signinState: req.session.isLogined,
            });
        } else{
            const chkId = await pool.query("select uid from users where uid=?;", [uid]);
            if(!chkId[0][0]){ // 중복된 아이디 확인
                const user = await pool.query("insert into users values (?, ?, ?, ?, 0, 'user');", [uid, upw, uname, uunitcode]);
                return res.render("signup-complete", {
                    title: "회원가입 성공",
                    uid: uid,
                    uname: uname,
                    signinState: req.session.isLogined,
                });
            } else {
                return res.render("signup.ejs", {
                    title: "회원가입",
                    errorData: {
                        id : "alreadyUsedErr", 
                        msg: "이미 사용중인 아이디입니다."
                    },
                    signinState: req.session.isLogined,
                });
            }
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 부대랭킹페이지
router.get("/ranking", async(req, res)=> {
    // const rankUser = await pool.query("select uid, uscore from users order by uscore desc;")
    try {
        const rankUnit = await pool.query("select uunitcode, sum(uscore) as score, count(uid) as num from users group by uunitcode order by sum(uscore) desc, num desc;")
        res.render("ranking", {
        //   res2: rankUser[0], // 개인랭킹 파라미터
            res3: rankUnit[0], // 부대별 점수 파라미터
            udata: req.session.udata,
            signinState: req.session.isLogined,
            title: "부대랭킹"
        });
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 부대랭킹페이지 검색요청
router.post("/ranking", async(req, res)=> {
    const {unitcode} = req.body;
    // 개인랭킹 SQL
    // const rankUser = await pool.query("select uid, uscore from users order by uscore desc;")
    // 부대랭킹 SQL
    try {
        const rankUnit = await pool.query("select uunitcode, sum(uscore) as score, count(uid) as num from quiz.users where uunitcode = ? group by uunitcode;", [unitcode])
        // return res.render("rankpage");
        res.render("ranking", {
        //   res2: rankUser[0], // 개인랭킹 파라미터
            res3: rankUnit[0], // 부대별 점수 파라미터
            udata: req.session.udata,
            signinState: req.session.isLogined,
            title: "부대랭킹"
        });
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 오늘의퀴즈페이지 접속
router.get("/quiz-today", async (req, res) => {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var date = year + "-" + month + "-" + day;
    try {
        const que_ans = await pool.query("SELECT * from quiz.quiz_today where date= ?", [date])
        if (req.session.uid) {
            const res1 = await pool.query(
                "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
                [req.session.uid, date]
            );
            if (res1[0].length == 0) {
                req.session.qid = [0, 0, 0, 0]; //문제를 4개 만들고
                req.session.aid = [0, 0, 0, 0]; //답도 4개 만든다.
                req.session.qid[0] = que_ans[0][0].q1
                req.session.qid[1] = que_ans[0][0].q2
                req.session.qid[2] = que_ans[0][0].q3
                req.session.qid[3] = que_ans[0][0].q4
                res.redirect("quiz-today/1");
            } else {
                res.send(
                    "<script>location.href='/'; alert('이미 오늘의 퀴즈를 푸셨습니다..');</script>"
                );
            }
        } else {
            res.render("signin", {
                quizStates: quizStates,
                title: "로그인",
                signinState: false,
            });
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

router.get("/quiz-today/:id", async (req, res) => {
    try {
        var today = new Date();
        var year = today.getFullYear();
        var month = "0" + (today.getMonth() + 1)
        var day = today.getDate();
        var date = year + "-" + month + "-" + day;
        var quizStates = {
            qid: parseInt(req.params.id),
        };
        const problem_number = req.session.qid[parseInt(req.params.id) - 1]
        //세션의 정보를 불러와서 정보 조회
        const correct_problem = await pool.query('select * from mil2 where rowno= ?', [problem_number])
        // 문제와 정답 뿌려주고
        const rowno = correct_problem[0][0].rowno
        const type = correct_problem[0][0].type
        // 나머지 정답 뿌려주고  (제목으로)
        const incorrect_problem = await pool.query('select title from mil2 where rowno!= ? and type = ? limit  4', [rowno, type])
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
            res.render("signin", {
                quizStates: quizStates,
                title: "로그인",
                signinState: false,
            });
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

router.post("/quiz-today/:id", async (req, res) => {
    req.session.aid[req.params.id - 1] = req.body.quiz;
    if (req.params.id == 4) {
        res.redirect("/quiz-today-complete");
    } else {
        res.redirect("/quiz-today/" + (parseInt(req.params.id) + 1));
    }
});

router.get("/quiz-today-complete", async (req, res) => {
    try {
        var indexStates = {
            quizTodayState: false,
            quizTodayCorrect: 0,
        };
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();
        var date = year + "-" + month + "-" + day;
        var uid = req.session.uid;
        var qid = req.session.qid; // 문제 번호
        var aid = req.session.aid; // 사용자 답
        console.log(aid);
        if (req.session.uid) {
            const user_res = await pool.query(
                "INSERT INTO res_quiz_today VALUES (null, ?, ?, ?, ?, ?, ? );",
                [uid, date, aid[0], aid[1], aid[2], aid[3]]
            );
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


            console.log(answer2);
            console.log(user_response2);

            cnt = 0

            for (i = 0; i < 4; i++) {
                if (answer2[i] == user_response2[i]) {
                    cnt += 1
                }
            }
            indexStates.quizTodayCorrect = cnt

            let score = 2 * cnt
            let user_score = await pool.query("select uscore from users where uid = ? ", [uid])

            let userscore = score + user_score[0][0].uscore
            console.log(userscore);
            const user_score2 = await pool.query("update users set uscore = ? where uid = ?", [userscore, uid])

            console.log(indexStates);

            res.render("quiz-today-complete", {
                title: "오늘의 퀴즈 완료",
                signinState: true,
                indexStates: indexStates
            });
        } else {
            res.redirect("/signin");
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 경쟁전페이지
router.get("/quiz-rank", async function (req, res, next) {
    try {
        if(req.session.uid) {
            return res.render("quiz-rank", {
                title: "경쟁전 로비",
                udata: req.session.udata,
                signinState: req.session.isLogined,
            });
        } else {
            return res.redirect('/signin')
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
});

// 관리자페이지
router.get("/admin", async function (req, res, next){
    try {
        const adminList = await pool.query(
            "SELECT utype FROM users WHERE uid = ?;", [req.session.udata.uid]
        );
        if(adminList[0][0].utype == 'admin') {
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
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})

router.get("/notice", async function (req, res, next){
    try {
        const notice = await pool.query(
            "select * from notice order by ntype desc, ndate desc;"
        );
        return res.render("ap_notice", {
            title: "관리자 페이지",
            udata: req.session.udata,
            signinState: req.session.isLogined,
            notice: notice[0],
        })
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})

router.get("/userpg", async function (req, res, next){
    try {
        const users = await pool.query(
            "select * from users;"
        );
        return res.render("ap_user", {
            title: "관리자 페이지",
            udata: req.session.udata,
            signinState: req.session.isLogined,
            users: users[0]
        })
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})

router.post("/adminnoticesave", async function(req, res, next){
    try {
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
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})

router.post("/adminnoticedel", async function(req, res, next){
    try {
        const nid = req.body.hiddennid;
        const delcon = await pool.query(
            "DELETE FROM notice WHERE nid = ?",[
                nid
            ]);
        return res.send("<script>alert('삭제되었습니다.'); history.back();</script>");
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})

router.post("/addadminnotice", async function(req, res, next){
    try {
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
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})

router.post("/adminuserdel", async function(req, res, next){
    try {
        const uid = req.body.hiddenuid;
        const adminuserdel = await pool.query(
            "DELETE FROM users WHERE uid = ?;",[
                uid
            ]);
        return res.send("<script>alert('삭제되었습니다.'); history.back();</script>");
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})

router.post("/adminuseredit", async function(req, res, next){
    try {
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
    } catch (error) {
        return res.render('error', {
            title: "에러",
            signinState: req.session.isLogined,
        });
    }
})
module.exports = router;