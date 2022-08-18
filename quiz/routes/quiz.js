const express = require("express");
const router = express.Router();
const pool = require("../db/db");

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
//            res.redirect('/signin')
//     }
// });

router.get("/today", async (req, res) => {
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

router.get("/today/:id", async (req, res) => {
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
    
router.post("/today/:id", async (req, res) => {
    try {
        req.session.aid[req.params.id - 1] = req.body.quiz;
        if (req.params.id == 4) {
            res.redirect("/quiz/today-complete");
        } else {
            res.redirect("/quiz/today/" + (parseInt(req.params.id) + 1));
        }
    } catch (error) {
        return res.redirect('error');
    }
});

router.get("/today-complete", async (req, res) => {
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

module.exports = router;
