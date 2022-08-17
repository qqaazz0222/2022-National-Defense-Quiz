var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "0112",
  database: "quiz",
};
var sessionStore = new MySQLStore(options);
module.exports = sessionStore;