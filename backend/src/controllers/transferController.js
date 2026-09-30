import mongoose from 'mongoose';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';

/**
 * @desc    Execute Inter-Warehouse Inventory Transfer with ACID Transaction guarantees
 * @route   POST /api/transfers
 * @access  Private (Admin, Manager)
 */
export const executeTransfer = async (req, res) => {
  const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = req.body;
  const transferQty = Number(quantity);

  // 1. Basic validation
  if (!productId || !fromWarehouseId || !toWarehouseId || !transferQty || transferQty <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transfer parameters. Product, source, target, and a positive quantity are required.',
    });
  }

  if (fromWarehouseId === toWarehouseId) {
    return res.status(400).json({
      success: false,
      message: 'Source and destination warehouses cannot be the same.',
    });
  }

  // 2. Fetch Product & Warehouses
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: `Product not found with ID: ${productId}` });
  }

  const fromWarehouse = await Warehouse.findById(fromWarehouseId);
  const toWarehouse = await Warehouse.findById(toWarehouseId);

  if (!fromWarehouse || !toWarehouse) {
    return res.status(404).json({ success: false, message: 'One or both specified warehouses do not exist.' });
  }

  // Check if connected MongoDB deployment is a Replica Set
  const topologyType = mongoose.connection.client?.topology?.description?.type;
  const isReplicaSet = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'ReplicaSetNoPrimary' || topologyType === 'Sharded';

  if (isReplicaSet) {
    // Execute with full multi-document ACID session transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const fromStock = await Stock.findOne({ product: productId, warehouse: fromWarehouseId }).session(session);
      if (!fromStock || fromStock.quantity < transferQty) {
        const available = fromStock ? fromStock.quantity : 0;
        throw new Error(`Insufficient inventory in source warehouse '${fromWarehouse.name}'. Available: ${available} ${product.unit}, Requested: ${transferQty} ${product.unit}`);
      }

      fromStock.quantity -= transferQty;
      fromStock.lastUpdated = new Date();
      await fromStock.save({ session });

      let toStock = await Stock.findOne({ product: productId, warehouse: toWarehouseId }).session(session);
      if (!toStock) {
        toStock = new Stock({
          product: productId,
          warehouse: toWarehouseId,
          quantity: transferQty,
          reorderLevel: product.minStockAlert || 15,
        });
      } else {
        toStock.quantity += transferQty;
        toStock.lastUpdated = new Date();
      }
      await toStock.save({ session });

      const txNumber = `TRF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const [tx] = await Transaction.create(
        [
          {
            transactionNumber: txNumber,
            type: 'TRANSFER',
            product: productId,
            fromWarehouse: fromWarehouseId,
            toWarehouse: toWarehouseId,
            quantity: transferQty,
            performedBy: req.user?._id || null,
            notes: notes || `Transferred ${transferQty} units of ${product.name} from ${fromWarehouse.name} to ${toWarehouse.name}`,
            status: 'COMPLETED',
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const populatedTx = await Transaction.findById(tx._id)
        .populate('product', 'name sku unit category')
        .populate('fromWarehouse', 'name code location')
        .populate('toWarehouse', 'name code location')
        .populate('performedBy', 'name email role');

      return res.status(200).json({
        success: true,
        message: `Successfully transferred ${transferQty} ${product.unit} from ${fromWarehouse.code} to ${toWarehouse.code}`,
        data: {
          transaction: populatedTx,
          sourceStockRemaining: fromStock.quantity,
          targetStockNew: toStock.quantity,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    // Atomic lock-and-balance logic for single-instance standalone deployments
    try {
      // 1. Atomic decrement only if sufficient quantity exists
      const sourceUpdate = await Stock.findOneAndUpdate(
        { product: productId, warehouse: fromWarehouseId, quantity: { $gte: transferQty } },
        { $inc: { quantity: -transferQty }, $set: { lastUpdated: new Date() } },
        { new: true }
      );

      if (!sourceUpdate) {
        const curStock = await Stock.findOne({ product: productId, warehouse: fromWarehouseId });
        const available = curStock ? curStock.quantity : 0;
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory in source warehouse '${fromWarehouse.name}'. Available: ${available} ${product.unit}, Requested: ${transferQty} ${product.unit}`,
        });
      }

      // 2. Atomic increment or upsert target stock
      let targetStock = await Stock.findOneAndUpdate(
        { product: productId, warehouse: toWarehouseId },
        {
          $inc: { quantity: transferQty },
          $set: { lastUpdated: new Date() },
          $setOnInsert: { reorderLevel: product.minStockAlert || 15 },
        },
        { new: true, upsert: true }
      );

      // 3. Create immutable Transaction audit log
      const txNumber = `TRF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const tx = await Transaction.create({
        transactionNumber: txNumber,
        type: 'TRANSFER',
        product: productId,
        fromWarehouse: fromWarehouseId,
        toWarehouse: toWarehouseId,
        quantity: transferQty,
        performedBy: req.user?._id || null,
        notes: notes || `Transferred ${transferQty} units of ${product.name} from ${fromWarehouse.name} to ${toWarehouse.name}`,
        status: 'COMPLETED',
      });

      const populatedTx = await Transaction.findById(tx._id)
        .populate('product', 'name sku unit category')
        .populate('fromWarehouse', 'name code location')
        .populate('toWarehouse', 'name code location')
        .populate('performedBy', 'name email role');

      return res.status(200).json({
        success: true,
        message: `Successfully transferred ${transferQty} ${product.unit} from ${fromWarehouse.code} to ${toWarehouse.code}`,
        data: {
          transaction: populatedTx,
          sourceStockRemaining: sourceUpdate.quantity,
          targetStockNew: targetStock.quantity,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * @desc    Get Transfer History
 * @route   GET /api/transfers
 * @access  Private
 */
export const getTransferHistory = async (req, res) => {
  try {
    const { warehouseId, productId, limit = 50 } = req.query;
    let query = { type: 'TRANSFER' };

    if (warehouseId) {
      query.$or = [{ fromWarehouse: warehouseId }, { toWarehouse: warehouseId }];
    }
    if (productId) {
      query.product = productId;
    }

    const transfers = await Transaction.find(query)
      .populate('product', 'name sku unit category unitPrice')
      .populate('fromWarehouse', 'name code location')
      .populate('toWarehouse', 'name code location')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
