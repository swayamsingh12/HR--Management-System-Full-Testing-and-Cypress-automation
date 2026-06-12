// Adds extra employees WITHOUT wiping existing data.
// Creates Employee + login User + LeaveBalance only — no attendance, no payroll.
// Safe to re-run: skips any employeeId/email that already exists.
//
// Usage: node addEmployees.js   (or: npm run add-employees)
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Employee from "./src/models/Employee.js";
import LeaveBalance from "./src/models/LeaveBalance.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

const newEmployees = [
  { employeeId: "EMP008", firstName: "Karan",  lastName: "Malhotra", email: "karan@hrms.com",  department: "Engineering", position: "Backend Developer",  salary: { basic: 58000, hra: 23000, allowances: 11000, deductions: 0 } },
  { employeeId: "EMP009", firstName: "Divya",  lastName: "Reddy",    email: "divya@hrms.com",  department: "Finance",     position: "Financial Analyst", salary: { basic: 62000, hra: 25000, allowances: 12000, deductions: 1500 } },
  { employeeId: "EMP010", firstName: "Aman",   lastName: "Kapoor",   email: "aman@hrms.com",   department: "Sales",       position: "Sales Manager",     salary: { basic: 70000, hra: 28000, allowances: 14000, deductions: 0 } },
  { employeeId: "EMP011", firstName: "Nisha",  lastName: "Pillai",   email: "nisha@hrms.com",  department: "Marketing",   position: "Content Lead",      salary: { basic: 48000, hra: 19000, allowances: 9500,  deductions: 0 } },
  { employeeId: "EMP012", firstName: "Rahul",  lastName: "Desai",    email: "rahul@hrms.com",  department: "Operations",  position: "Ops Analyst",       salary: { basic: 46000, hra: 18000, allowances: 9000,  deductions: 500 } },
  { employeeId: "EMP013", firstName: "Pooja",  lastName: "Shah",     email: "pooja@hrms.com",  department: "HR",          position: "Recruiter",         salary: { basic: 44000, hra: 17000, allowances: 8500,  deductions: 0 } },
  { employeeId: "EMP014", firstName: "Sahil",  lastName: "Khanna",   email: "sahil@hrms.com",  department: "Engineering", position: "Frontend Developer",salary: { basic: 56000, hra: 22000, allowances: 11000, deductions: 0 } },
  { employeeId: "EMP015", firstName: "Tara",   lastName: "Menon",    email: "tara@hrms.com",   department: "Engineering", position: "DevOps Engineer",   salary: { basic: 65000, hra: 26000, allowances: 13000, deductions: 0 } },
  { employeeId: "EMP016", firstName: "Yash",   lastName: "Gupta",    email: "yash@hrms.com",   department: "Sales",       position: "Sales Executive",   salary: { basic: 42000, hra: 16000, allowances: 8000,  deductions: 0 } },
  { employeeId: "EMP017", firstName: "Ananya", lastName: "Bose",     email: "ananya@hrms.com", department: "Finance",     position: "Accountant",        salary: { basic: 59000, hra: 24000, allowances: 11500, deductions: 1000 } },
];

let created = 0;
let skipped = 0;

for (const cfg of newEmployees) {
  const exists = await Employee.findOne({
    $or: [{ employeeId: cfg.employeeId }, { email: cfg.email }],
  });
  if (exists) {
    console.log(`  skip   ${cfg.employeeId} (${cfg.email}) — already exists`);
    skipped++;
    continue;
  }

  const employee = await Employee.create({
    employeeId: cfg.employeeId,
    firstName: cfg.firstName,
    lastName: cfg.lastName,
    email: cfg.email,
    phone: "9999999999",
    dateOfBirth: new Date("1995-01-01"),
    dateOfJoining: new Date("2024-01-01"),
    department: cfg.department,
    position: cfg.position,
    salary: cfg.salary,
    salaryAtJoining: cfg.salary,
    isActive: true,
  });

  await User.create({
    email: cfg.email,
    password: `${cfg.employeeId}@123`,
    role: "employee",
    employeeId: employee._id,
    isActive: true,
  });

  await LeaveBalance.create({
    employee: employee._id,
    annual: { total: 12, used: 0, remaining: 12 },
    casual: { total: 6, used: 0, remaining: 6 },
    sick: { total: 6, used: 0, remaining: 6 },
  });

  console.log(`  create ${cfg.employeeId}  ${cfg.firstName} ${cfg.lastName}  <${cfg.email}>  pw=${cfg.employeeId}@123`);
  created++;
}

console.log(`\nDone. Created ${created}, skipped ${skipped}. (No attendance or payroll generated.)`);
await mongoose.disconnect();
