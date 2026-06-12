import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Employee from "./src/models/Employee.js";
import Attendance from "./src/models/Attendance.js";
import Payroll from "./src/models/Payroll.js";
import Leave from "./src/models/Leave.js";
import LeaveBalance from "./src/models/LeaveBalance.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

// ---------------------------------------------------------------------------
// Reset the demo data set so seeding is repeatable.
// WARNING: this clears all HRMS collections in the configured database.
// ---------------------------------------------------------------------------
await Payroll.deleteMany({});
await Leave.deleteMany({});
await Attendance.deleteMany({});
await LeaveBalance.deleteMany({});
await Employee.deleteMany({});
await User.deleteMany({});

// Drop any indexes left over from older schema versions (the payroll
// collection previously had a unique compound index).
try {
  await Payroll.collection.dropIndexes();
} catch (e) {
  // Collection may not exist yet on a fresh database — safe to ignore.
}

// ----------------------------- Staff accounts ------------------------------
await User.create({
  email: "admin@hrms.com",
  password: "password123",
  role: "admin",
  isActive: true,
});

await User.create({
  email: "hr@hrms.com",
  password: "password123",
  role: "hr",
  isActive: true,
});

// --------------------------- Employee factory ------------------------------
const createEmployee = async ({
  employeeId,
  firstName,
  lastName,
  email,
  department,
  position,
  salary,
  isActive = true,
}) => {
  const employee = await Employee.create({
    employeeId,
    firstName,
    lastName,
    email,
    phone: "9999999999",
    dateOfBirth: new Date("1995-01-01"),
    dateOfJoining: new Date("2024-01-01"),
    department,
    position,
    salary,
    salaryAtJoining: salary,
    isActive,
  });

  await User.create({
    email,
    password: `${employeeId}@123`,
    role: "employee",
    employeeId: employee._id,
    isActive,
  });

  await LeaveBalance.create({
    employee: employee._id,
    annual: { total: 12, used: 0, remaining: 12 },
    casual: { total: 6, used: 0, remaining: 6 },
    sick: { total: 6, used: 0, remaining: 6 },
  });

  return employee;
};

// Each entry declares an attendance pattern for the current month:
//   "weekends" -> present every day incl. Sat/Sun (triggers overpay BUG-2)
//   "weekdays" -> present Mon-Fri only (normal-ish payroll)
//   "partial"  -> present only the first ~10 weekdays
// The two "weekends" employees keep a full month (incl. today) so BUG-2 stays
// reproducible; everyone else has today left open so the Punch In button is
// testable.
const employeeConfigs = [
  { employeeId: "EMP001", firstName: "Asha",   lastName: "Verma",  email: "asha@hrms.com",   department: "Engineering", position: "Software Developer", salary: { basic: 50000, hra: 20000, allowances: 10000, deductions: 0 }, attendance: "weekends" },
  { employeeId: "EMP002", firstName: "Rohan",  lastName: "Mehta",  email: "rohan@hrms.com",  department: "Sales",       position: "Sales Executive",   salary: { basic: 40000, hra: 15000, allowances: 8000,  deductions: 0 }, attendance: "weekdays" },
  { employeeId: "EMP003", firstName: "Priya",  lastName: "Nair",   email: "priya@hrms.com",  department: "Finance",     position: "Accountant",        salary: { basic: 60000, hra: 25000, allowances: 12000, deductions: 2000 }, attendance: "weekdays" },
  { employeeId: "EMP004", firstName: "Vikram", lastName: "Singh",  email: "vikram@hrms.com", department: "Marketing",   position: "Marketing Manager", salary: { basic: 80000, hra: 30000, allowances: 15000, deductions: 0 }, attendance: "partial" },
  { employeeId: "EMP005", firstName: "Sneha",  lastName: "Iyer",   email: "sneha@hrms.com",  department: "HR",          position: "HR Executive",      salary: { basic: 45000, hra: 18000, allowances: 9000,  deductions: 0 }, attendance: "weekdays", isActive: false },
  { employeeId: "EMP006", firstName: "Arjun",  lastName: "Rao",    email: "arjun@hrms.com",  department: "Operations",  position: "Operations Lead",   salary: { basic: 55000, hra: 22000, allowances: 11000, deductions: 1000 }, attendance: "weekends" },
  { employeeId: "EMP007", firstName: "Meera",  lastName: "Joshi",  email: "meera@hrms.com",  department: "Engineering", position: "QA Engineer",       salary: { basic: 52000, hra: 20000, allowances: 10000, deductions: 0 }, attendance: "weekdays" },
];

// -------------------- Attendance for the current month ---------------------
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth(); // 0-based
const today = now.getDate();
const daysInMonth = new Date(year, month + 1, 0).getDate();
const lastDay = Math.min(daysInMonth, 28);

const buildAttendance = (employeeId, pattern, openToday) => {
  const records = [];
  let weekdayCount = 0;
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Leave today's record out so the employee can test the Punch In button.
    if (openToday && day === today) continue;
    if (pattern === "none") continue;
    if (pattern === "weekdays" && isWeekend) continue;
    if (pattern === "partial") {
      if (isWeekend) continue;
      weekdayCount++;
      if (weekdayCount > 10) continue;
    }

    records.push({
      employee: employeeId,
      date,
      punchIn: { time: new Date(year, month, day, 9, 0, 0), location: "Office" },
      punchOut: { time: new Date(year, month, day, 18, 0, 0), location: "Office" },
      status: "present",
      workingHours: 9,
    });
  }
  return records;
};

const employees = {};
for (const cfg of employeeConfigs) {
  const emp = await createEmployee(cfg);
  employees[cfg.employeeId] = emp;
  // Weekend employees keep today (overpay volume); others leave today open.
  const openToday = cfg.attendance !== "weekends";
  const records = buildAttendance(emp._id, cfg.attendance, openToday);
  if (records.length) await Attendance.insertMany(records);
}

// ----------------------------- Pending leaves ------------------------------
// Gives the HR/Admin "Leave Management" screens something to act on.
await Leave.create({
  employee: employees.EMP003._id,
  leaveType: "casual",
  startDate: new Date(year, month, 20),
  endDate: new Date(year, month, 21),
  days: 2,
  reason: "Family function out of town for two days.",
  status: "pending",
});

await Leave.create({
  employee: employees.EMP004._id,
  leaveType: "annual",
  startDate: new Date(year, month, 25),
  endDate: new Date(year, month, 27),
  days: 3,
  reason: "Planned vacation with family, booked in advance.",
  status: "pending",
});

// --------------------------------- Summary ---------------------------------
console.log("\nSeed complete.");
console.log("Staff accounts:");
console.log("  Admin -> admin@hrms.com / password123");
console.log("  HR    -> hr@hrms.com    / password123");
console.log("\nEmployees (password = <employeeId>@123):");
for (const cfg of employeeConfigs) {
  const status = cfg.isActive === false ? "INACTIVE" : "active";
  console.log(
    `  ${cfg.employeeId}  ${cfg.firstName} ${cfg.lastName}  <${cfg.email}>  [${cfg.department}, ${status}, attendance:${cfg.attendance}]`,
  );
}
console.log("\n2 pending leave requests created (EMP003, EMP004).");

await mongoose.disconnect();
