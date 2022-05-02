// Import and require inquirer and mysql2
const express = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  );

const viewAll = ()=>{
    inquirer.prompt([
        {
            type: "list",
            choices: ["View All Employees", "Add Employee", "Update Employee Role", " View All Roles", "Add A Role", "View All Departments", "Add A Department", "Exit"],
            name: "ViewMenu"
        },
    ]).then(res => {
        switch (res.ViewMenu) {
            case "View All Employees":
                viewAllEmployees();
                break;
            
            case "Add Employee":
                addEmployee();
                break;
            
            case "Update Employee Role":
                updateEmployeeRole();
                break;

            case "View All Roles":
                viewAllRoles();
                break;
            
            case "Add A Role":
                addRole();
                break;
            
            case "View All Departments":
                viewAllDepartments();
                break;

            case "Add A Department":
                addDepartment();
                break;
            
            default:
                process.exit();
        }
    })
}


