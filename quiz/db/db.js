const mysql      = require('mysql');
const mysql2 = require('mysql2/promise')

const connection = mysql.createConnection({
  host     : '15.165.221.104',
  port     : '54573',
  user     : 'root',
  password : '11111111',
  database : 'quiz'
});

const pool = mysql2.createPool({
  host     : '15.165.221.104',
  port     : '54573',
  user     : 'root',
  password : '11111111',
  database : 'quiz'
});


connection.connect();

module.exports = pool;
module.exports = connection;