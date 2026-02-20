import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  setSalary,
} from "../controllers/employeeController.js";
import {
  getEmployeeAttendance,
  punchInForEmployee,
  punchOutForEmployee,
  regularizeAttendance,
  getAllAttendance,
} from "../controllers/attendanceController.js";
import {
  getPendingLeaves,
  updateLeaveStatus,
  getAllLeaves,
} from "../controllers/leaveController.js";
import {
  generatePayroll,
  getAllPayrolls,
  downloadPayslip,
} from "../controllers/payrollController.js";

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize("admin"));

// ============= EMPLOYEE ROUTES =============
router.get("/employees", getEmployees);
router.post("/employees", createEmployee);
router.get("/employees/:id", getEmployee);
router.put("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);
router.patch("/employees/:id/status", updateEmployeeStatus);
router.put("/employees/:id/salary", setSalary);
router.patch("/employees/:id/activate", updateEmployeeStatus);
router.patch("/employees/:id/deactivate", updateEmployeeStatus);

// ============= ATTENDANCE ROUTES =============
router.get("/attendance", getAllAttendance);
router.get("/attendance/:employeeId", getEmployeeAttendance);
router.post("/attendance/:employeeId/punch-in", punchInForEmployee);
router.post("/attendance/:employeeId/punch-out", punchOutForEmployee);
router.patch("/attendance/:id/regularize", regularizeAttendance);

// ============= LEAVE ROUTES =============
router.get("/leaves", getPendingLeaves);
router.patch("/leaves/:id/approve", updateLeaveStatus);
router.patch("/leaves/:id/reject", updateLeaveStatus);
router.patch("/leaves/:id", updateLeaveStatus);

// ============= PAYROLL ROUTES =============
router.post("/payroll/generate", generatePayroll);
router.get("/payroll", getAllPayrolls);
router.get("/payroll/:id", downloadPayslip);
router.get("/payroll/:id/payslip", downloadPayslip);

export default router;
