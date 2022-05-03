// Import and require inquirer and mysql2
const mysql = require('mysql2/promise');
const cTable = require('console.table');
const inquirer = require('inquirer');

// Connect to database
const createDbConnection = async () => {
    let db = await mysql.createConnection(
        {
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'company_db'
        });
    return db;
}

const viewAll = ()=>{
    inquirer.prompt([
        {
            type: "list",
            choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add A Role", "View All Departments", "Add A Department", "Exit"],
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

viewAll();
const db = createDbConnection();

const getEmployeesData = async () => {
    let dbConn = await db;
    const [rows, fields] = await dbConn.execute('SELECT e.id, e.first_name, e.last_name, r.title, r.salary FROM employee as e LEFT JOIN roles as r ON e.role_id = r.id');
    return rows;
}

const getRolesData = async () => {
    let dbConn = await db;
    const [rows, fields] = await dbConn.execute('SELECT r.id, r.title, r.salary, d.dep_name FROM roles as r LEFT JOIN department as d ON r.department_id = d.id');
    return rows;
}

const getDepartmentsData = async () => {
    let dbConn = await db;
    const [rows, fields] = await dbConn.execute('SELECT * FROM department');
    return rows;
}

const getEmployeesPromptData = async () => {
    let data = await getEmployeesData();
    let promptData = {}
    promptData["employeeIdList"] = []
    promptData["employeeNameList"] = []
    data.forEach(element => {
        promptData.employeeIdList.push(element.id);
        promptData.employeeNameList.push(element.first_name + " " + element.last_name);
    });
    return promptData;
}

const getRolesPromptData = async () => {
    let data = await getRolesData();
    let promptData = {}
    promptData["roleIdList"] = []
    promptData["roleNameList"] = []
    data.forEach(element => {
        promptData.roleIdList.push(element.id);
        promptData.roleNameList.push(element.title);
    });
    return promptData    
}

const getDepartmentsPromptData = async () => {
    let data = await getDepartmentsData();
    let promptData = {}
    promptData["departmentIdList"] = []
    promptData["departmentNameList"] = []
    data.forEach(element => {
        promptData.departmentIdList.push(element.id);
        promptData.departmentNameList.push(element.dep_name);
    });
    return promptData    
}



const viewAllEmployees = async () => {
    let employees = await getEmployeesData();
    console.table(employees);
    viewAll();
};

const viewAllRoles = async () => {
    let roles = await getRolesData();
    console.table(roles);
    viewAll();
};

const viewAllDepartments = async () => {
    let departments = await getDepartmentsData();
    console.table(departments);
    viewAll();
};

const addEmployee = async () => {
    let employeeData = await getEmployeesPromptData();
    let deptData = await getDepartmentsPromptData();
    inquirer.prompt([
        {type: 'input', message: 'First Name?', name: 'first'},
        {type: 'input', message: 'Last Name?', name: 'last'},
        {type: 'list', choices: deptData.departmentNameList, name: 'roleName'},
        {type: 'list', choices: employeeData.employeeNameList, name: 'managerName'}
    ]).then(async res => {
        let managerIdx = employeeData.employeeNameList.indexOf(res.managerName);
        let managerId = employeeData.employeeIdList[managerIdx];

        let roleIdx = deptData.departmentNameList.indexOf(res.roleName);
        let roleId = deptData.departmentIdList[roleIdx];

        let dbConn = await db;
        let data = await dbConn.execute(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`, [res.first, res.last, roleId, managerId]); 
        console.log("Employee Added!", data);
        viewAll();
    });
}


const addDepartment = () => {
    inquirer.prompt([
        {type: 'input', message: 'Please Enter Department Name', name: 'department'},
    ]).then(async res => {
        let dbConn = await db;
        let data = await dbConn.execute(`INSERT INTO department (dep_name) VALUES (?)`,[res.department]);
        console.log("Department Added!");
        viewAll();
    });
}

const addRole = () => {
    inquirer.prompt([
        {type: 'input', message: 'Please Enter Title', name: 'title'},
        {type: 'input', message: 'Please enter salary', name: 'salary'},
        {name: 'input', message: 'please enter department_id', name: 'departmentId'}
    ]).then(async res => {
        let dbConn = await db;
        let data = await dbConn.execute(`INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`, [res.title, res.salary, res.departmentId]);
        console.log("New Role Added!");
        viewAll();
    });
}




const updateEmployeeRole = async () => {
    let employeePromptData = await getEmployeesPromptData();
    let rolePromptData = await getRolesPromptData();

    inquirer.prompt([
        {type: 'list', name: 'employeeName', choices: employeePromptData.employeeNameList},
        {type: 'list', name: 'roleName', choices: rolePromptData.roleNameList}
    ]).then(async res => {
        let employeeIdx = employeePromptData.employeeNameList.indexOf(res.employeeName);
        let employeeId = employeePromptData.employeeIdList[employeeIdx];

        let roleIdx = rolePromptData.roleNameList.indexOf(res.roleName);
        let roleId = rolePromptData.roleIdList[roleIdx];

        let dbConn = await db;
        let result = await dbConn.execute('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, employeeId]);
        viewAll();
    })
}