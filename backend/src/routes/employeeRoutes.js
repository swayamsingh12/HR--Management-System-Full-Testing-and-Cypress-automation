import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  updateEmployeeStatus,
} from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("admin", "hr"), createEmployee);
router.get("/", authorize("admin", "hr"), getEmployees);
router.get("/:id", getEmployee); // Allow all authenticated users to view employee details
router.put("/:id", updateEmployee); // Allow employees to update their own profile
router.patch("/:id/status", authorize("admin", "hr"), updateEmployeeStatus);

export default router;
