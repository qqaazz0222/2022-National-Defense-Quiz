const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : '52.79.160.104',
  port     : '59421',
  user     : 'root',
  password : '11111111',
  database : 'quiz'
});

connection.connect();

module.exports = connection;