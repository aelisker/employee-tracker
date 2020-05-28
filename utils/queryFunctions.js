// const cTable = require('console.table');
// const startingPrompt = require('../server');
// const connection = require('../db/db');

// async function viewDepartments () {
//   const sql = 'SELECT * FROM department';
//   connection.promise().query(sql, (err, row) => {
//     if (err) {
//       console.log(`Error: ${err}`);
//       return;
//     }
//     console.table(row);
//     startingPrompt();
//     return;
//   });
// };

// async function viewRoles () {
//   const sql = 'SELECT * FROM role';
//   connection.promise().query(sql, (err, row) => {
//     if (err) {
//       console.log(`Error: ${err}`);
//       return;
//     }
//     console.table(row);
//     return;
//   });
// };

// async function viewEmployees () {
//   const sql = 'SELECT * FROM employee';
//   connection.promise().query(sql, (err, row) => {
//     if (err) {
//       console.log(`Error: ${err}`);
//       return;
//     }
//     console.table(row);
//     return;
//   });
// };

// module.exports = { viewDepartments, viewRoles, viewEmployees };