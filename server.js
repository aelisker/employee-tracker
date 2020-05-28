const inquirer = require('inquirer');
// const { viewDepartments, viewRoles, viewEmployees } = require('./utils/queryFunctions');
const cTable = require('console.table');
const connection = require('./db/db');

async function startingPrompt() {
  return inquirer
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
        viewEmployees();
        break;
      case 'Add a Department':
        console.log('Adding a Department');
        addDepartment();
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
  });
}; 

async function viewDepartments () {
  const sql = 'SELECT * FROM department';
  connection.promise().query(sql, (err, row) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }
    console.table(row);
    startingPrompt();
    return;
  });
};

async function viewRoles () {
  const sql = 'SELECT title, salary, department.name FROM role LEFT JOIN department ON department_id = department.id';
  connection.promise().query(sql, (err, row) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }
    console.table(row);
    startingPrompt();
    return;
  });
};

async function viewEmployees () {
  // found information on inserting manager from https://stackoverflow.com/questions/7451761/how-to-get-the-employees-with-their-managers
  const sql = 'SELECT e.id, e.first_name, e.last_name, role.title, department.name, role.salary, CONCAT(m.first_name,\' \', m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON role.department_id = department.id';
  connection.promise().query(sql, (err, row) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }
    console.table(row);
    startingPrompt();
    return;
  });
};

async function addDepartment () {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'What is the name of the new department?',
        name: 'newDept',
        validate: dept => {
          if (dept) return true;
          else {
            console.log('You must enter a department name!');
            return false;
          }
        }
      }
    ])
    .then(choice => {
      const newDept = choice.newDept;
      const sql = `INSERT INTO department (name) VALUES ('${newDept}')`;
      connection.promise().query(sql, (err, row) => {
        if (err) {
          console.log(`Error: ${err}`);
          return;
        }
        console.table(row);
        startingPrompt();
        return;
      });
    })
};

startingPrompt();