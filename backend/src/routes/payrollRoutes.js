import express from 'express';
import {
  generatePayroll,
  getMyPayrolls,
  getAllPayrolls,
  downloadPayslip
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('admin', 'hr'), generatePayroll);
router.get('/me', getMyPayrolls);
router.get('/', authorize('admin', 'hr'), getAllPayrolls);
router.get('/:id/payslip', downloadPayslip);

export default router;

