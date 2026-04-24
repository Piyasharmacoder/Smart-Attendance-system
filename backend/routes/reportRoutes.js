import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
  getReport,
  exportExcel,
  exportPDF
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/', protect, getReport);
router.get('/excel', protect, exportExcel);
router.get('/pdf', protect, exportPDF);

export default router;