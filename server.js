const inquirer = require('inquirer');
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
        'View Employees',
        'Add a Department',
        'Add a Role',
        'Modify Employees',
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
      case 'View Employees':
        console.log('Viewing Employees');
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
      case 'Modify Employees':
        console.log('How would you like to Modify Employees?');
        modifyEmployee();
        break;
      case 'Exit and Save Database':
        endConnection();
        break;
    }
  });
}; 

async function viewEmployees() {
  return inquirer
  .prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'userChoice',
      choices: [
        'View all Employees',
        'View Employee by Manager',
        'View Employee by Department',
        'Go back'
      ]
    }
  ])
  .then(choice => {
    switch (choice.userChoice) {
      case 'View all Employees':
        console.log('Viewing all Employees');
        viewAllEmployees();
        break;
      case 'View Employee by Manager':
        console.log('Viewing Employees by Manager');
        viewEmployeesByManager();
        break;
      case 'View Employee by Department':
        console.log('Viewing Employees by Department');
        viewEmployeesByDepartment();
        break;
      case 'Go back':
        startingPrompt();
        break;
    }
  });
}

async function modifyEmployee() {
  return inquirer
  .prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'userChoice',
      choices: [
        'Add an Employee',
        'Update an Employee\'s Role',
        'Update an Employee\'s Manager',
        'Delete an Employee',
        'Go back'
      ]
    }
  ])
  .then(choice => {
    switch (choice.userChoice) {
      case 'Add an Employee':
        console.log('Adding an Employee');
        addEmployee();
        break;
      case 'Update an Employee\'s Role':
        console.log('Updating an Employee');
        updateEmployeeRole();
        break;
      case 'Update an Employee\'s Manager':
        console.log('Updating Employee\'s Manager');
        updateEmployeeManager();
        break;
      case 'Delete an Employee':
        console.log('Deleting Employee');
        deleteEmployee();
        break;
      case 'Go back':
        startingPrompt();
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

async function viewAllEmployees () {
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

async function viewEmployeesByDepartment () {
  const deptName = await getDeptNamesAndValues();
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'View employees by which department?',
      name: 'deptIdShowingName',
      choices: ['None', ...deptName]
    }
  ])
  .then(selection => {
    if (selection.deptIdShowingName === 'None') {
      startingPrompt();
      return;
    } else {
      console.log(selection.deptIdShowingName);
      const sql = `SELECT CONCAT(first_name, ' ', last_name) AS employee, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department_id = ${selection.deptIdShowingName}`;
      connection.promise().query(sql, (err, row) => {
        if (err) {
          console.log(`Error: ${err}`);
          return;
        }
        console.table(row);
        startingPrompt();
        return;
      });
    }
  })
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

// get role titles, return as promise
async function getDeptNames() {
  const sql = `SELECT name FROM department`;
  return new Promise((resolve, reject) => {
    return connection.query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return reject(err);
      }
      const deptArr = [];
      row.forEach(dept => {
        deptArr.push(dept.name);
      });
      resolve(deptArr);
    });
  })
};

async function getDeptNamesAndValues() {
  const sql = `SELECT * FROM department`;
  return new Promise((resolve, reject) => {
    return connection.query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return reject(err);
      }
      // Method was shown during office hours
      const deptArr = row.map(dept => {
        const deptChoice = {name: dept.name, value: dept.id};
        return deptChoice;
      });
      resolve(deptArr);
    });
  })
};

// get role titles, return as promise
async function getRoleTitles() {
  const sql = 'SELECT title FROM role';
  return new Promise((resolve, reject) => {
    return connection.query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return reject(err);
      }
      const roleArr = [];
      row.forEach(role => {
        roleArr.push(role.title);
      });
      resolve(roleArr);
    });
  })
};

// get employee names, return as promise
async function getEmployeeNamesAndValues() {
  const sql = `SELECT * FROM employee`;
  return new Promise((resolve, reject) => {
    return connection.query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return reject(err);
      }
      // Method was shown during office hours
      const empArr = row.map(emp => {
        const empChoice = {name: (emp.first_name + ' ' + emp.last_name), value: emp.id};
        return empChoice;
      });
      resolve(empArr);
    });
  })
};

// await promise response from getDeptNames, use spread to populate choices
async function addRole () {
  const deptNames = await getDeptNames();
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
      choices: [...deptNames]
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
};

// take two promises of role titles and manager names, await promises, use for add
async function addEmployee () {
  const roles = await getRoleTitles();
  const managers = await getEmployeeNamesAndValues();
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'What is the new employee\'s first name?',
        name: 'newEmpFirstName',
        validate: firstName => {
          if (firstName) return true;
          else {
            console.log('You must enter a first name!');
            return false;
          }
        }
      },
      {
        type: 'input',
        message: 'What is the new employee\'s last name?',
        name: 'newEmpLastName',
        validate: lastName => {
          if (lastName) return true;
          else {
            console.log('You must enter a last name!');
            return false;
          }
        }
      },
      {
        type: 'list',
        message: 'What is this employee\'s role?',
        name: 'newEmpRole',
        choices: [...roles]
      },
      {
        type: 'list',
        message: 'Does this employee have a manager? If so, who?',
        name: 'newEmpManager',
        choices: ['None', ...managers]
      }
    ])
    .then(selection => {
      let sql;
      if (selection.newEmpManager === 'None') {
        sql = `INSERT INTO employee (first_name, last_name, role_id) VALUES ('${selection.newEmpFirstName}', '${selection.newEmpLastName}', (SELECT id FROM role WHERE title = '${selection.newEmpRole}'))`;
      } else {
        sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${selection.newEmpFirstName}', '${selection.newEmpLastName}', (SELECT id FROM role WHERE title = '${selection.newEmpRole}'), ${selection.newEmpManager})`;
      }

      connection.promise().query(sql, (err, row) => {
        if (err) {
          console.log(`Error: ${err}`);
          return;
        }
        startingPrompt();
        return;
      });
    })
};

// await promise response from getDeptNames, use spread to populate choices
async function updateEmployeeRole () {
  const employee = await getEmployeeNamesAndValues();
  const roles = await getRoleTitles();
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'Which employee is being reassigned?',
      name: 'empIdBasedOnConcatName',
      choices: [...employee]
    },
    {
      type: 'list',
      message: 'What role is this employee being assigned to?',
      name: 'newEmpRole',
      choices: [...roles]
    }
  ])
  .then(selection => {
    const sql = `UPDATE employee SET role_id = (SELECT id FROM role WHERE title = '${selection.newEmpRole}') WHERE id = ${selection.empIdBasedOnConcatName}`;
    connection.promise().query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return;
      }
      startingPrompt();
      return;
    });
  })
};

async function updateEmployeeManager () {
  const employee = await getEmployeeNamesAndValues();
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'Which employee is being reassigned?',
      name: 'empIdBasedOnConcatName',
      choices: [...employee],
    },
    {
      type: 'list',
      message: 'Who is this empoyee\'s manager?',
      name: 'newEmpManager',
      choices: ['None', ...employee]
      // validate: choice => {
      //   if (choice === empIdBasedOnConcatName || choice === choice.empIdBasedOnConcatName) {
      //     console.log('An employee cannot be his or her own manager!');
      //     return false;
      //   } else {
      //     return true;
      //   }
      // }
    }
  ])
  .then(selection => {
    let sql;
      if (selection.newEmpManager === 'None') {
        sql = `UPDATE employee SET manager_id = NULL WHERE id = ${selection.empIdBasedOnConcatName}`;
      } else if(selection.newEmpManager === selection.empIdBasedOnConcatName) {
        console.log('An employee cannot be his or her own manager! Setting value to NULL.');
        sql = `UPDATE employee SET manager_id = NULL WHERE id = ${selection.empIdBasedOnConcatName}`;
      } else {
        sql = `UPDATE employee SET manager_id = ${selection.newEmpManager} WHERE id = ${selection.empIdBasedOnConcatName}`;
      }

    connection.promise().query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return;
      }
      startingPrompt();
      return;
    });
  })
};

async function deleteEmployee () {
  const employee = await getEmployeeNamesAndValues();
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'Which employee would you like to delete?',
      name: 'empIdBasedOnConcatName',
      choices: ['None', ...employee]
    }
  ])
  .then(selection => {
    if (selection.empIdBasedOnConcatName === 'None') {
      startingPrompt();
      return;
    } else {
      const sql = `DELETE FROM employee WHERE id = ${selection.empIdBasedOnConcatName}`;
      connection.promise().query(sql, (err, row) => {
        if (err) {
          console.log(`Error: ${err}`);
          return;
        }
        startingPrompt();
        return;
      });
    }
  })
};

async function endConnection() {
  await connection.end(err => {
    if (err) throw err;
    console.log('Succesfully saved your database.');
  });
};

startingPrompt();