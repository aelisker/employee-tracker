const mysql = require('mysql2');
const inquirer = require('inquirer');
// const {viewDepartments, viewRoles} = require('./utils/queryFunctions');
const pw = require('./utils/mysqlPassword');
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: pw,
  database: 'employee_db'
});

async function beginPrompt() {
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'userChoice',
      choices: [
        'View all Departments',
        'View all Roles',
        'View all Employees',
        'Add an Employee',
        'Add a Department',
        'Add a Role',
        'Add an Empoyee',
        'Update an Employee Role'
      ]
    }
  ])
  .then(choice => {
    console.log(choice.userChoice);
    switch (choice.userChoice) {
      case 'View all Departments':
        console.log('Viewing all Departments');
        viewDepartments();
        break;
      case 'View all Roles':
        console.log('Viewing all Roles');
        viewRoles();
        break;
      case 'View all Employees':
        console.log('Viewing all Employees');
        break;
      case 'Add a Department':
        console.log('Adding a Department');
        break;
      case 'Add a Role':
        console.log('Adding a Role');
        break;
      case 'Add an Employee':
        console.log('Adding an Employee');
        break;
      case 'Update an Employee Role':
        console.log('Updating an Employee');
        break;
    }
    console.log('Switch End');
  });
}; 

async function viewDepartments () {
  console.log('View Dept Success');
  const sql = 'SELECT * FROM department';
  await connection.query(sql, (err, row) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }
    console.table(row);
    return;
  });
};

beginPrompt();