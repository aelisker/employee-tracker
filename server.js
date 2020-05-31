const inquirer = require('inquirer');
const cTable = require('console.table');
const connection = require('./db/db');

// this is the prompt list where we start
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
  // choose function based on prompt response
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
        console.log('How would you like to view employees?');
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

// this is where we select how we would like to view employees
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

// this is where the user chooses how to modify an employee
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

// view all departments
async function viewDepartments () {
  const sql = 'SELECT * FROM department';
  connection.promise().query(sql, (err, row) => {
    if (err) {
      console.log(`Error: ${err}`);
      return;
    }
    // use cTable to view formatted response
    console.table(row);
    startingPrompt();
    return;
  });
};

// view all roles and department they belong to
async function viewRoles () {
  // join department and roles to show parent department for role
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

// view all employees, their managers, departments, and roles
async function viewAllEmployees () {
  // found information on self joins https://stackoverflow.com/questions/7451761/how-to-get-the-employees-with-their-managers
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

// view all employees by chosen department
async function viewEmployeesByDepartment () {
  // use async await to wait for promise response, then proceed
  const deptName = await getDeptNamesAndValues();
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'View employees by which department?',
      name: 'deptIdShowingName',
      // use spread to populate array with values from deptName
      choices: ['None', ...deptName]
    }
  ])
  .then(selection => {
    // if user selects none, do not feed that value into query
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

// view all employees by selected manager
async function viewEmployeesByManager () {
  const managerName = await getEmployeeNamesAndValues();
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'View employees by which manager?',
      name: 'managerIdByName',
      choices: ['None', ...managerName]
    }
  ])
  .then(selection => {
    // to check employees with no manager, use IS NULL. for everything else, use else query
    let sql;
    if (selection.managerIdByName === 'None') {
      sql = `SELECT CONCAT(first_name, ' ', last_name) AS employee FROM employee WHERE manager_id IS NULL`;
    } else {
      sql = `SELECT CONCAT(first_name, ' ', last_name) AS employee FROM employee WHERE manager_id = ${selection.managerIdByName}`;
    }
    connection.promise().query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return;
      } 
      // if there is nowthing in response array, employee doesn't manage anybody
      if (row.length === 0) {
        console.log('This person manages nobody!');
        startingPrompt();
        return;
      } else {
        console.table(row);
        startingPrompt();
        return;
      }  
    });
  });
};

// get role titles, return as promise
async function getRoleTitles() {
  const sql = 'SELECT title FROM role';
  // method shown during office hours. before this, I was trying to return the roleArr on it's own without returning who connection as promise
  // allows this to be called with await in another async function
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

// get employee names, return id as promise
async function getEmployeeNamesAndValues() {
  const sql = `SELECT * FROM employee`;
  return new Promise((resolve, reject) => {
    return connection.query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return reject(err);
      }
      // Method was shown during office hours. before this, was using subqueries every time. this is much better
      const empArr = row.map(emp => {
        const empChoice = {name: (emp.first_name + ' ' + emp.last_name), value: emp.id};
        return empChoice;
      });
      resolve(empArr);
    });
  })
};

// get department names, return id as promise
async function getDeptNamesAndValues() {
  const sql = `SELECT * FROM department`;
  return new Promise((resolve, reject) => {
    return connection.query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return reject(err);
      }
      const deptArr = row.map(dept => {
        const deptChoice = {name: dept.name, value: dept.id};
        return deptChoice;
      });
      resolve(deptArr);
    });
  })
};

// add new department
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
        console.log('Department added!');
        startingPrompt();
        return;
      });
    })
};

// await promise response from getDeptNamesAndValues, use spread to populate choices
async function addRole () {
  const deptNames = await getDeptNamesAndValues();
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
      name: 'newRoleDeptValueBasedOnName',
      choices: [...deptNames]
    }
  ])
  .then(selection => {
    const sql = `INSERT INTO role (title, salary, department_id) VALUES ('${selection.newRoleName}', ${selection.newRoleSalary}, ${selection.newRoleDeptValueBasedOnName})`;
    // below is example of query using subquery used before I learned method to assign id value to array
    // const sql = `INSERT INTO role (title, salary, department_id) VALUES ('${selection.newRoleName}', ${selection.newRoleSalary}, (SELECT id FROM department WHERE name = '${selection.newRoleDept}'))`;

    connection.promise().query(sql, (err, row) => {
      if (err) {
        console.log(`Error: ${err}`);
        return;
      }
      console.log('Role added!');
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
        console.log('Employee added!');
        startingPrompt();
        return;
      });
    })
};

// await promise response from getRoleTitles, use spread to populate choices
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
      console.log('Role updated!');
      startingPrompt();
      return;
    });
  })
};

// update the manager of an employee
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
      // was trying to get this to work to ensure employee isn't own manager. couldn't get working within inquirer prompts, so used next code block to handle
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
    // if person selects none, set value to null. if they select employee as own manager, give message and also set null
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

// delete an employee
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
        console.log('Employee deleted!');
        startingPrompt();
        return;
      });
    }
  })
};

// safely end connection
async function endConnection() {
  await connection.end(err => {
    if (err) throw err;
    console.log('Succesfully saved your database.');
  });
};

// call starting prompt
startingPrompt();