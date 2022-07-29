var express = require('express');
var router = express.Router();
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "11111111",
  database: "quiz",
};
var sessionStore = new MySQLStore(options);

router.use(
  session({
    secret: "passwording",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);