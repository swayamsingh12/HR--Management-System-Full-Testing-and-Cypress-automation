import express from 'express';
import {
  punchIn,
  punchOut,
  getMyAttendance,
  getEmployeeAttendance,
  regularizeAttendance,
  punchInForEmployee,
  punchOutForEmployee
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.post('/punchout', punchOut);
router.get('/me', getMyAttendance);
router.get('/employee/:id', authorize('admin', 'hr'), getEmployeeAttendance);
router.post('/employee/:employeeId/punch-in', authorize('admin', 'hr'), punchInForEmployee);
router.post('/employee/:employeeId/punch-out', authorize('admin', 'hr'), punchOutForEmployee);
router.patch('/:id/regularize', authorize('admin', 'hr'), regularizeAttendance);

export default router;

