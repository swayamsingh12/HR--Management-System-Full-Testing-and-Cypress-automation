import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus,
  getMyLeaveBalance
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', applyLeave);
router.get('/me', getMyLeaves);
router.get('/balance/me', getMyLeaveBalance);
router.get('/pending', authorize('admin', 'hr'), getPendingLeaves);
router.patch('/:id', authorize('admin', 'hr'), updateLeaveStatus);

export default router;

