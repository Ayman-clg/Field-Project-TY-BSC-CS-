import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  getWarehouses,
  createWarehouse,
  getStockOverview,
  adjustStock,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Products
router.get('/products', protect, getProducts);
router.post('/products', protect, authorize('Admin', 'Manager'), createProduct);
router.put('/products/:id', protect, authorize('Admin', 'Manager'), updateProduct);

// Warehouses
router.get('/warehouses', protect, getWarehouses);
router.post('/warehouses', protect, authorize('Admin'), createWarehouse);

// Stock & Adjustments
router.get('/stock', protect, getStockOverview);
router.post('/stock/adjust', protect, authorize('Admin', 'Manager', 'Clerk'), adjustStock);

export default router;
