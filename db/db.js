const mysql = require('mysql2');
const pw = require('../utils/mysqlPassword');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: pw,
  database: 'employee_db'
});

connection.connect(err => {
  if (err) {
    throw err;
  }
});

module.exports = connection;