var express = require("express");
var router = express.Router();
var connection = require("../db/db");
const { query } = require("../db/db2");
var pool = require("../db/db2");

// router.get("/today", function (req, res, next) {
//     var today = new Date();
//     var year = today.getFullYear();
//     var month = today.getMonth() + 1;
//     var day = today.getDate();
//     var date = year + "-" + month + "-" + day;
//     if (req.session.uid) {
//         connection.query(
//             "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
//             [req.session.uid, date],
//             (err1, res1, fld1) => {
//                 try {
//                     if (res1.length == 0) {
//                         req.session.qid = [0, 0, 0, 0, 0];
//                         req.session.aid = [0, 0, 0, 0, 0];
//                         res.redirect("today/1");
//                     } else {
//                         res.send(
//                             "<script>location.href='/'; alert('이미 오늘의 퀴즈를 푸셨습니다..');</script>"
//                         );
//                     }
//                 } catch (err1) {
//                     throw err1;
//                 }
//             }
//         );
//     } else {
//         res.render("signin", {
//             quizStates: quizStates,
//             title: "로그인",
//             signinState: false,
//         });
//     }
// });

router.get("/today", async (req, res) => {
    var today = new Date();
    var year = today.getFullYear();
    var month = "0" + (today.getMonth() + 1)
    var day = today.getDate();
    var date = year + "-" + month + "-" + day;
    const que_ans = await pool.query("SELECT * from quiz.quiz_today where date= ?",[date])
    // quiz_today에서 question하고 answer 정보를 가져온다.
    // 가지고 온 정보를 토대로 문제 title 하고 정답을 가져온다.

    // req session 에 저장한다.

    if (req.session.uid) {
        const res1 = await pool.query(
            "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
            [req.session.uid, date]
        );
        console.log(que_ans[0][0]);

        try {
            if (res1.length - 2 == 0) {
                req.session.qid = [0, 0, 0, 0]; //문제를 4개 만들고
                req.session.aid = [0, 0, 0, 0]; //답도 4개 만든다.
                req.session.qid[0]=que_ans[0][0].q1
                req.session.qid[1]=que_ans[0][0].q2
                req.session.qid[2]=que_ans[0][0].q3
                req.session.qid[3]=que_ans[0][0].q4
                res.redirect("today/1");
            } else {
                res.send(
                    "<script>location.href='/'; alert('이미 오늘의 퀴즈를 푸셨습니다..');</script>"
                );
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        res.render("signin", {
            quizStates: quizStates,
            title: "로그인",
            signinState: false,
        });
    }
});

router.get("/today/:id", async(req, res) => {
    var today = new Date();
    var year = today.getFullYear();
    var month = "0" + (today.getMonth() + 1)
    var day = today.getDate();
    var date = year + "-" + month + "-" + day;
    console.log(req.session.qid);
    var quizStates = {
        qid: parseInt(req.params.id),
    };

    const problem_number = parseInt(req.params.id)
    
    //세션의 정보를 불러와서 정보 조회
    const correct_problem = await pool.query('select * from mil where rowno= ?',[problem_number])

    // 문제와 정답 뿌려주고
    const rowno = correct_problem[0][0].rowno
    const type = correct_problem[0][0].type

    // 나머지 정답 뿌려주고 
    const incorrect_problem = await pool.query('select exp from mil where rowno!= ? and type = ? limit  3',[rowno ,type ])

    // ques, answr값 불러와서 정보 조회
    const quiz_today = await pool.query('select * from quiz_today where date = ?',[date]);


    // a1, a2, a3, a4를 리스트로 저장해서 뿌리자
    // var answer = []
    // for (let i = 1; i < 5; i++){
    //     b = 'a'+ i
    //     let c = String(b)
    //     console.log(b);
    //     console.log(c);

    //     console.log(quiz_today[0][0].c);
    //     answer.push(quiz_today[0][0].c);
    // }
    // console.log(answer);

    let ans = []
    ans.push(quiz_today[0][0].a1)
    ans.push(quiz_today[0][0].a2)
    ans.push(quiz_today[0][0].a3)
    ans.push(quiz_today[0][0].a4)


    

    //


    if (req.session.uid) {
        res.render("quiz-today", {
            req:req.session.qid,
            correct_problem: correct_problem[0][0],
            incorrect_problem: incorrect_problem,
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
});

router.post("/today/:id", async (req, res) => {
    // req.session.qid[req.params.id - 1] = req.params.id;
    // console.log(req.session.qid[req.params.id - 1]); // q_id
    req.session.aid[req.params.id - 1] = req.body.quiz;
    // console.log(req.session.aid[req.params.id - 1]); // a_id
    if (req.params.id == 4) {
        res.redirect("/quiz/today-complete");
    } else {
        res.redirect("/quiz/today/" + (parseInt(req.params.id) + 1));
    }
});

router.get("/today-complete", async (req, res) => {
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
        try {
            res.render("quiz-today-complete", {
                title: "오늘의 퀴즈 완료",
                signinState: true,
            });
        } catch (error) {
            console.log(error);
        }
    } else {
        res.redirect("/signin");
    }
});

router.get("/battle", function (req, res, next) {
    var signinStates = {};
    if (req.session.uid) {
        res.render("quiz-battle", {
            signinStates: signinStates,
            title: "오늘의 퀴즈",
            signinState: true,
        });
    } else {
        res.render("signin", {
            signinStates: signinStates,
            title: "로그인",
            signinState: false,
        });
    }
});

module.exports = router;
