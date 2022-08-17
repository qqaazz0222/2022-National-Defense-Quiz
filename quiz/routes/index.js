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

router.get("/test", async function (req, res, next) {
    const qIndex = await pool.query("SELECT * FROM `quiz-rank` ORDER BY RAND() LIMIT 10;");
    let content = {"questions":[]}
    for(let i=0; i<10; i++) {
        let question = qIndex[0][i].question;
        let {choices1, choices2, choices3} = qIndex[0][i];
        let num = parseInt(Math.random()*4);
        let qData = await pool.query("SELECT title, exp FROM mil2 WHERE rowno IN (?, ?, ?, ?)",[question, choices1, choices2, choices3]);
        let choices = [qData[0][1].title.split('(')[0], qData[0][2].title.split('(')[0], qData[0][3].title.split('(')[0]];
        choices.splice(num, 0, qData[0][0].title.split('(')[0]);
        let data = {"question": qData[0][0].exp.split('.')[0]+".", "choices": choices, "correctAnswer":num};
        console.log(qData[0][0].exp.split(',')[0]);
        content.questions.push(data);
    }
    res.json(content);
});

    // connection.query("SELECT * FROM `quiz-rank` ORDER BY RAND() LIMIT 10;", (error, res) => {
    //     let content = {"questions":[]}
    //     if (error) throw error;ss
    //     for(let i=0; i<10; i++) {
    //         let question = res[i].question;
    //         let {choices1, choices2, choices3} = res[i];
    //         let num = parseInt(Math.random()*4);
    //         connection.query("SELECT title, exp FROM mil WHERE rowno IN (?, ?, ?, ?)",[question, choices1, choices2, choices3], (error, qData) => {
    //             if (error) throw error;
    //             let choices = [qData[1].exp, qData[2].exp, qData[3].exp];
    //             choices.splice(num, 0, qData[0].exp);
    //             let data = {"question": qData[0].title, "choices": choices, "correctAnswer":num};
    //             content.questions.push(data);
    //             console.log(i , "PASS"), content;
    //         });
    //     } 
    //     console.log("last", content);
    //     // io.sockets.in(id).emit("sendQuestions", content);
    //     return res.json(content);
    // });
// =======
// /* GET home page. */
// router.get("/", async (req, res) => {
//     var indexStates = {
//         quizTodayState: false,
//         quizTodayCorrect: 0,
//     };
//     var today = new Date();
//     var year = today.getFullYear();
//     var month = today.getMonth() + 1;
//     var day = today.getDate();
//     var date = year + "-" + month + "-" + day;



//     if (req.session.uid) { // 아이디 있는지 로그인했는지
//         const res1 = await pool.query(
//             "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
//             [req.session.uid, date]
//         );
//         console.log(res1);

//         console.log(indexStates);

//         try {
//             if (res1[0].length == 0) {
//                 console.log("hello1"); // 문제를 푼적없는지
//                 res.render("index", {
//                     indexStates: indexStates,
//                     title: "신박하군",
//                     signinState: true,
//                 });

//             } else { // 문제를 푼적 있다면
//                 console.log('hello1');
//                 const quiz_state = await pool.query("select uid from res_quiz_today where date = ? and uid = ?", [date, req.session.uid])

//                 console.log(quiz_state[0].length);
//                 // 퀴즈 풀었는지 확인
//                 if (quiz_state[0].length != 0) {
//                     console.log('hello2');
//                     indexStates.quizTodayState = true

//                     // 몇개 맞추었는지 확인
//                     // 문제 답 가져오기, 사용자 응답가져오기
//                     const answer = await pool.query("select a1, a2, a3, a4 from quiz_today where date = ? ", [date])
//                     const user_response = await pool.query("select r1, r2, r3, r4 from res_quiz_today where date = ? and uid = ?", [date, req.session.uid])

//                     let answer2 = []
//                     let user_response2 = []

//                     answer2.push(answer[0][0].a1);
//                     answer2.push(answer[0][0].a2);
//                     answer2.push(answer[0][0].a3);
//                     answer2.push(answer[0][0].a4);
//                     user_response2.push(parseInt(user_response[0][0].r1))
//                     user_response2.push(parseInt(user_response[0][0].r2))
//                     user_response2.push(parseInt(user_response[0][0].r3))
//                     user_response2.push(parseInt(user_response[0][0].r4))


//                     console.log(answer2);
//                     console.log(user_response2);

//                     cnt = 0

//                     for (i = 0; i < 4; i++) {
//                         if (answer2[i] == user_response2[i]) {
//                             cnt += 1
//                         }
//                     }
//                     indexStates.quizTodayCorrect = cnt
//                     console.log(indexStates);

//                     res.render("index", {
//                         indexStates: indexStates,
//                         title: "신박하군",
//                         signinState: true,
//                     });
//                 }

//             }

//         } catch (error) {
//             console.log(error);
//         }

//     } else {
//         console.log("hello3");
//         res.render("index", { title: "신박하군", signinState: false });
//     }


// }

// );

// // router.get("/", function (req, res, next) {
// //   var indexStates = {
// //     quizTodayState: false,
// //     quizTodayCorrect: 0,
// //   };
// //   var today = new Date();
// //   var year = today.getFullYear();
// //   var month = today.getMonth() + 1;
// //   var day = today.getDate();
// //   var date = year + "-" + month + "-" + day;
// //   if (req.session.uid) {
// //     connection.query(
// //       "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
// //       [req.session.uid, date],
// //       (err1, res1, fld1) => {
// //         try {
// //           if (res1.length == 0) {
// //             res.render("index", {
// //               indexStates: indexStates,
// //               title: "신박하군",
// //               signinState: true,
// //             });
// //           } else {
// //             indexStates.quizTodayState = true;
// //             indexStates.quizTodayCorrect = 4;
// //             res.render("index", {
// //               indexStates: indexStates,
// //               title: "신박하군",
// //               signinState: true,
// //             });
// //           }
// //         } catch (err1) {
// //           throw err1;
// //         }
// //       }
// //     );
// //   } else {
// //     res.render("index", { title: "신박하군", signinState: false });
// //   }
// // });

// router.get("/test22", async (req, res) => {
//     var today = new Date();
//     var year = today.getFullYear();
//     var month = today.getMonth() + 1;
//     var day = today.getDate();
//     var date = year + "-" + month + "-" + day;

//     console.log(date);
//     console.log(req.session.uid);
//     const res1 = await pool.query(
//         "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
//         [req.session.uid, date]
//     );
//     console.log(res1[0].length);


//     res.render("test");
// });

// router.post("/test", upload.single("img"), async (req, res) => {
//     const imgfile = req.file;
//     console.log(imgfile);
//     res.render("test", { title: "테스트" });
// });

// router.get("/testproblem", async (req, res) => {
//     //랜덤 1~4까지 나중에 -1할것
//     function random() {
//         let lotto = [];
//         let i = 0;
//         while (i < 4) {
//             let n = Math.floor(Math.random() * 4) + 1;
//             if (!sameNum(n)) {
//                 lotto.push(n);
//                 i++;
//             }
//         }
//         function sameNum(n) {
//             for (var i = 0; i < lotto.length; i++) {
//                 if (n === lotto[i]) {
//                     return true;
//                 }
//             }
//             return false;
//         }
//         return lotto;
//     }

//     let random1 = random();
//     let random2 = random();
//     let random3 = random();
//     let random4 = random();
//     console.log(random1);
//     console.log(random2);
//     console.log(random3);
//     console.log(random4);

//     //  4정답 이상한거 매칭(안맞는 거)가져온 것을 랜덤으로 뿌려주기

//     //전술
//     // (랜덤으로 que, ans 5개 가져오기 )
//     const tactics = await pool.query(
//         "select * from quiz.mil where type= '전술' order by RAND() limit 4 ;"
//     );

//     //용어
//     const concept = await pool.query(
//         "select * from quiz.mil where type= '용어' order by RAND() limit 4 ;"
//     );

//     //무기
//     const weapon = await pool.query(
//         "select * from quiz.mil where type= '무기' order by RAND() limit 4 ;"
//     );

//     //사건
//     const accident = await pool.query(
//         "select * from quiz.mil where type= '사건' order by RAND() limit 4 ;"
//     );

//     // console.log(tactics[0]);
//     // console.log(concept[0]);

//     // quiz_today Table에 ques: row , a : random(i).indexOf(1) + 1

//     var today = new Date();
//     var year = today.getFullYear();
//     var month = today.getMonth() + 1;
//     var day = today.getDate();
//     var date = year + "-" + month + "-" + day;

//     const today_quiz = await pool.query(
//         "INSERT INTO quiz_today VALUES (null,?,?,?,?,?,?,?,?,? ); ",
//         [
//             date,
//             tactics[0][0].rowno,
//             concept[0][0].rowno,
//             weapon[0][0].rowno,
//             accident[0][0].rowno,
//             random1.indexOf(1) + 1,
//             random2.indexOf(1) + 1,
//             random3.indexOf(1) + 1,
//             random4.indexOf(1) + 1,
//         ]
//     );

//     res.render("problem", {
//         tactics: tactics[0], //전술
//         concept: concept[0], //용어
//         weapon: weapon[0], //무기
//         accident: accident[0], //사건
//         random1: random1,
//         random2: random2,
//         random3: random3,
//         random4: random4,
//     });
// });

// router.get("/test222", async (req, res) => {
//     var today = new Date();
//     var year = today.getFullYear();
//     var month = "0" + (today.getMonth() + 1)
//     var day = today.getDate();
//     var date = year + "-" + month + "-" + day;
//     console.log(date);
//     // quiz_today에서 question하고 answer 정보를 가져온다.
//     const que_ans = await pool.query("SELECT * from quiz_today where date = ?", [date])
//     // 가지고 온 정보를 토대로 문제 title 하고 정답을 가져온다.
//     console.log(que_ans[0]);
//     const q1 = (que_ans[0][0].q1);
//     const q2 = (que_ans[0][0].q2);
//     const q3 = (que_ans[0][0].q3);
//     const q4 = (que_ans[0][0].q4);

//     //답
//     const a1 = (que_ans[0][0].a1);
//     const a2 = (que_ans[0][0].a2);
//     const a3 = (que_ans[0][0].a3);
//     const a4 = (que_ans[0][0].a4);

//     req.session.quiz_info = que_ans[0]

//     console.log(req.session.quiz_info);


//     // req session 에 저장한다.

//     req.session.save(function () {
//         res.redirect("test");
//     })
// >>>>>>> feature/todayQuiz


module.exports = router;
