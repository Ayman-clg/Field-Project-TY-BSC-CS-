import express from 'express';
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
} from '../controllers/purchaseOrderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), createPurchaseOrder);
router.get('/', protect, getPurchaseOrders);
router.get('/:id', protect, getPurchaseOrderById);
router.patch('/:id/status', protect, authorize('Admin', 'Manager'), updatePurchaseOrderStatus);

export default router;
