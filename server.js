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
        'Update an Employee Role',
        'Exit and Save Database'
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
        addRole();
        break;
      case 'Add an Employee':
        console.log('Adding an Employee');
        break;
      case 'Update an Employee Role':
        console.log('Updating an Employee');
        break;
      case 'Exit and Save Database':
        endConnection();
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

async function addRole () {
  const roleSql = `SELECT name FROM department;`;
  connection.promise().query(roleSql, (err, row) => {
    console.log(row);
    inquirer
    .prompt([
      {
        type: 'input',
        message: 'What is the name of the new role?',
        name: 'newRoleName',
        validate: roleName => {
          if (roleName) return true;
          else {
            console.log('You must enter a role name!');
            return false;
          }
        }
      },
      {
        type: 'input',
        message: 'What is the salary of the new role?',
        name: 'newRoleSalary',
        validate: roleSalary => {
          if (!isNaN(roleSalary) && roleSalary) return true;
          else {
            console.log('You must enter a role salary as a number!');
            return false;
          }
        }
      },
      {
        type: 'list',
        message: 'What department does this role belong to?',
        name: 'newRoleDept',
        choices: () => {
          const choices = row.map(choice => choice.name);
          return choices;
        }
        
      }
    ])
    .then(selection => {
      const sql = `INSERT INTO role (title, salary, department_id) VALUES ('${selection.newRoleName}', ${selection.newRoleSalary}, (SELECT id FROM department WHERE name = '${selection.newRoleDept}'))`;
      connection.promise().query(sql, (err, row) => {
        if (err) {
          console.log(`Error: ${err}`);
          return;
        }
        startingPrompt();
        return;
      });
    })
  })
};

async function endConnection() {
  await connection.end(err => {
    if (err) throw err;
    console.log('Succesfully saved your database.');
  });
};

startingPrompt();