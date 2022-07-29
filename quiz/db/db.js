const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '11111111',
  database : 'quiz'
});

connection.connect();

module.exports = connection;