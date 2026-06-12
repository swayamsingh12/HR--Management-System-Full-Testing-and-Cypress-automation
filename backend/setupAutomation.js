import mongoose from "mongoose";
import dotenv from "dotenv";
import { pathToFileURL } from "url";
import User from "./src/models/User.js";
import Employee from "./src/models/Employee.js";
import Attendance from "./src/models/Attendance.js";
import Payroll from "./src/models/Payroll.js";
import LeaveBalance from "./src/models/LeaveBalance.js";

const AUTOMATION_EMPLOYEES = [
  {
    code: "AUTO01",
    firstName: "Quinn",
    lastName: "Automation",
    email: "qa.primary@hrms.com",
    department: "Engineering",
    position: "QA Automation Engineer",
    salary: { basic: 50000, hra: 20000, allowances: 10000, deductions: 0 },
    attendance: "weekends",
    isActive: true,
  },
  {
    code: "AUTO02",
    firstName: "Eli",
    lastName: "Exit",
    email: "qa.exit@hrms.com",
    department: "Sales",
    position: "Sales Representative",
    salary: { basic: 40000, hra: 15000, allowances: 8000, deductions: 0 },
    attendance: "none",
    isActive: true,
  },
];

export async function setupAutomationEmployees() {
  const codes = AUTOMATION_EMPLOYEES.map((a) => a.code);
  const emails = AUTOMATION_EMPLOYEES.map((a) => a.email);

  const existing = await Employee.find({
    $or: [{ employeeId: { $in: codes } }, { email: { $in: emails } }],
  });
  const ids = existing.map((e) => e._id);
  if (ids.length) {
    await Attendance.deleteMany({ employee: { $in: ids } });
    await Payroll.deleteMany({ employee: { $in: ids } });
    await LeaveBalance.deleteMany({ employee: { $in: ids } });
  }
  await User.deleteMany({ email: { $in: emails } });
  await Employee.deleteMany({
    $or: [{ employeeId: { $in: codes } }, { email: { $in: emails } }],
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lastDay = Math.min(daysInMonth, 28);

  for (const a of AUTOMATION_EMPLOYEES) {
    const employee = await Employee.create({
      employeeId: a.code,
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      phone: "9876500000",
      dateOfBirth: new Date("1995-01-01"),
      dateOfJoining: new Date("2024-01-01"),
      department: a.department,
      position: a.position,
      salary: a.salary,
      salaryAtJoining: a.salary,
      isActive: a.isActive,
    });

    await User.create({
      email: a.email,
      password: `${a.code}@123`,
      role: "employee",
      employeeId: employee._id,
      isActive: a.isActive,
    });

    await LeaveBalance.create({
      employee: employee._id,
      annual: { total: 12, used: 0, remaining: 12 },
      casual: { total: 6, used: 0, remaining: 6 },
      sick: { total: 6, used: 0, remaining: 6 },
    });

    if (a.attendance === "weekends") {
      const records = [];
      for (let day = 1; day <= lastDay; day++) {
        records.push({
          employee: employee._id,
          date: new Date(year, month, day),
          punchIn: { time: new Date(year, month, day, 9, 0, 0), location: "Office" },
          punchOut: { time: new Date(year, month, day, 18, 0, 0), location: "Office" },
          status: "present",
          workingHours: 9,
        });
      }
      await Attendance.insertMany(records);
    }
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  dotenv.config();
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB. Refreshing automation employees...");
  await setupAutomationEmployees();
  console.log("\nAutomation employees ready (fresh):");
  console.log("  AUTO01  qa.primary@hrms.com / AUTO01@123  (salary 50k/20k/10k, weekend attendance this month)");
  console.log("  AUTO02  qa.exit@hrms.com    / AUTO02@123  (active; used for exit/deactivation tests)");
  await mongoose.disconnect();
}
