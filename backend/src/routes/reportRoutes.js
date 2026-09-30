import express from 'express';
import { streamPurchaseOrderPDF } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Purchase Order PDF Streaming Endpoint
router.get('/po/:id/pdf', protect, streamPurchaseOrderPDF);

export default router;
