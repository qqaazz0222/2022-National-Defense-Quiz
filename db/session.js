var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var options = {
  host: "15.165.221.104",
  port: 54573,
  user: "root",
  password: "11111111",
  database: "quiz",
};
var sessionStore = new MySQLStore(options);
module.exports = sessionStore;