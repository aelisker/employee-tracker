const { connection } = require('../server');
const cTable = require('console.table');

async function viewDepartments () {
  console.log('View Dept Success');
  const sql = 'SELECT * FROM department';
  connection.query(sql, (err, row) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }
    console.table(row);
  });
};

async function viewRoles () {
  console.log('View Roles Success');
};

module.exports = { viewDepartments, viewRoles };