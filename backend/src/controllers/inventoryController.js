import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';

// ================= PRODUCT CONTROLLERS =================

export const getProducts = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { sku, name, description, category, unit, unitPrice, minStockAlert, initialWarehouseStock } = req.body;

    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: `Product with SKU '${sku}' already exists`,
      });
    }

    const product = await Product.create({
      sku: sku.toUpperCase(),
      name,
      description,
      category: category || 'General',
      unit: unit || 'Units',
      unitPrice: Number(unitPrice) || 0,
      minStockAlert: Number(minStockAlert) || 20,
    });

    // If initial stock allocation provided for a warehouse
    if (initialWarehouseStock && initialWarehouseStock.warehouseId && initialWarehouseStock.quantity > 0) {
      const stock = await Stock.create({
        product: product._id,
        warehouse: initialWarehouseStock.warehouseId,
        quantity: Number(initialWarehouseStock.quantity),
        reorderLevel: Number(minStockAlert) || 20,
      });

      // Log initial receipt transaction
      await Transaction.create({
        transactionNumber: `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'INITIAL',
        product: product._id,
        toWarehouse: initialWarehouseStock.warehouseId,
        quantity: Number(initialWarehouseStock.quantity),
        notes: 'Initial product onboarding stock allocation',
        performedBy: req.user?._id || null,
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= WAREHOUSE CONTROLLERS =================

export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: 1 });
    res.json({ success: true, count: warehouses.length, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { name, code, location, capacity, contactPerson } = req.body;
    const existing = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Warehouse code already exists' });
    }

    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      location,
      capacity: Number(capacity) || 10000,
      contactPerson,
    });
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= STOCK CONTROLLERS =================

export const getStockOverview = async (req, res) => {
  try {
    const { warehouseId, productId, lowStockOnly } = req.query;
    let filter = {};

    if (warehouseId && warehouseId !== 'All') {
      filter.warehouse = warehouseId;
    }
    if (productId) {
      filter.product = productId;
    }

    const stockRecords = await Stock.find(filter)
      .populate('product')
      .populate('warehouse')
      .sort({ updatedAt: -1 });

    let data = stockRecords.filter((item) => item.product && item.warehouse);

    if (lowStockOnly === 'true') {
      data = data.filter((item) => item.quantity <= (item.product?.minStockAlert || item.reorderLevel));
    }

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { productId, warehouseId, quantity, type, notes } = req.body;
    // type: 'ADD', 'REMOVE', or 'SET'

    let stock = await Stock.findOne({ product: productId, warehouse: warehouseId });
    if (!stock) {
      if (type === 'REMOVE') {
        return res.status(400).json({ success: false, message: 'Cannot reduce stock that does not exist' });
      }
      stock = new Stock({
        product: productId,
        warehouse: warehouseId,
        quantity: 0,
      });
    }

    const prevQty = stock.quantity;
    let newQty = prevQty;
    const adjustQty = Number(quantity);

    if (type === 'ADD') {
      newQty = prevQty + adjustQty;
    } else if (type === 'REMOVE') {
      if (prevQty < adjustQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Current: ${prevQty}, Requested reduction: ${adjustQty}`,
        });
      }
      newQty = prevQty - adjustQty;
    } else if (type === 'SET') {
      newQty = adjustQty;
    }

    stock.quantity = newQty;
    stock.lastUpdated = new Date();
    await stock.save();

    // Log transaction
    const tx = await Transaction.create({
      transactionNumber: `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'ADJUSTMENT',
      product: productId,
      toWarehouse: warehouseId,
      quantity: Math.abs(newQty - prevQty),
      notes: notes || `Manual stock adjustment (${type}): from ${prevQty} to ${newQty}`,
      performedBy: req.user?._id || null,
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        stock,
        transaction: tx,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
