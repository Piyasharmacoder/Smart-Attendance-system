import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

import {
  requestOT,
  updateOT,
  getAllOT
} from '../controllers/overtimeController.js';

const router = express.Router();

// Employee request
router.post('/request', protect, requestOT);

// Manager/Admin approve
router.put('/:id',
  protect,
  authorize('manager', 'admin'),
  updateOT
);

// Manager/Admin view
router.get('/',
  protect,
  authorize('manager', 'admin'),
  getAllOT
);

export default router;