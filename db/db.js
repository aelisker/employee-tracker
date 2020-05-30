const mysql = require('mysql2');
const pw = require('../utils/mysqlPassword');

require('dotenv').config();

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.DB_PW,
  database: 'employee_db'
});

connection.connect(err => {
  if (err) {
    throw err;
  }
});

module.exports = connection;