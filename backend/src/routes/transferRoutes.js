import express from 'express';
import { executeTransfer, getTransferHistory } from '../controllers/transferController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), executeTransfer);
router.get('/', protect, getTransferHistory);

export default router;
