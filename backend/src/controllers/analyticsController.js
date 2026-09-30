import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Total counts
    const totalProducts = await Product.countDocuments();
    const totalWarehouses = await Warehouse.countDocuments();
    const totalPOs = await PurchaseOrder.countDocuments();

    // 2. Fetch all stocks with products
    const stocks = await Stock.find().populate('product').populate('warehouse');

    let totalInventoryValue = 0;
    let totalStockUnits = 0;
    const warehouseStockMap = {};
    const lowStockAlerts = [];

    // Initialize map with all warehouses
    const warehouses = await Warehouse.find();
    warehouses.forEach((w) => {
      warehouseStockMap[w._id.toString()] = {
        name: w.name,
        code: w.code,
        location: w.location,
        capacity: w.capacity,
        totalUnits: 0,
        totalValue: 0,
        itemCount: 0,
      };
    });

    stocks.forEach((s) => {
      if (!s.product || !s.warehouse) return;

      const unitPrice = s.product.unitPrice || 0;
      const val = s.quantity * unitPrice;

      totalInventoryValue += val;
      totalStockUnits += s.quantity;

      const whId = s.warehouse._id.toString();
      if (warehouseStockMap[whId]) {
        warehouseStockMap[whId].totalUnits += s.quantity;
        warehouseStockMap[whId].totalValue += val;
        warehouseStockMap[whId].itemCount += 1;
      }

      // Check if low stock
      const minAlert = s.product.minStockAlert || s.reorderLevel || 15;
      if (s.quantity <= minAlert) {
        lowStockAlerts.push({
          stockId: s._id,
          productName: s.product.name,
          sku: s.product.sku,
          category: s.product.category,
          warehouseName: s.warehouse.name,
          warehouseCode: s.warehouse.code,
          currentQuantity: s.quantity,
          minStockAlert: minAlert,
          unit: s.product.unit,
        });
      }
    });

    const warehouseBreakdown = Object.values(warehouseStockMap);

    // 3. Category distribution
    const categoryMap = {};
    stocks.forEach((s) => {
      if (!s.product) return;
      const cat = s.product.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + s.quantity;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      value: count,
    }));

    // 4. Recent transactions
    const recentActivity = await Transaction.find()
      .populate('product', 'name sku unit')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalWarehouses,
          totalStockUnits,
          totalInventoryValue,
          totalPOs,
          lowStockCount: lowStockAlerts.length,
        },
        warehouseBreakdown,
        categoryBreakdown,
        lowStockAlerts: lowStockAlerts.slice(0, 10),
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
