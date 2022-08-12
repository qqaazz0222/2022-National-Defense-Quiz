const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : '15.165.221.104',
  port     : '54573',
  user     : 'root',
  password : '11111111',
  database : 'quiz'
});

connection.connect();

module.exports = connection;