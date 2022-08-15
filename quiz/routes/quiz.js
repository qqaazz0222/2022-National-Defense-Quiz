var express = require("express");
var router = express.Router();
var connection = require("../db/db");
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
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var date = year + "-" + month + "-" + day;
    if (req.session.uid) {
        const res1 = await pool.query(
            "SELECT date FROM res_quiz_today WHERE uid = ? AND date = ?;",
            [req.session.uid, date]
        );
        try {
            if (res1.length - 2 == 0) {
                req.session.qid = [0, 0, 0, 0]; //문제를 6개 만들고
                req.session.aid = [0, 0, 0, 0]; //답도 6개 만든다.
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

router.get("/today/:id", function (req, res, next) {
    console.log(req.session);
    var quizStates = {
        qid: parseInt(req.params.id),
    };
    console.log(quizStates);
    if (req.session.uid) {
        res.render("quiz-today", {
            quizStates: quizStates,
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

router.post("/today/:id", function (req, res, next) {
    req.session.qid[req.params.id - 1] = req.params.id;
    console.log(req.session.qid[req.params.id - 1]); // q_id
    req.session.aid[req.params.id - 1] = req.body.quiz;
    console.log(req.session.aid[req.params.id - 1]); // a_id
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
