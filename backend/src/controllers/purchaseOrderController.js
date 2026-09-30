import PurchaseOrder from '../models/PurchaseOrder.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';

export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, targetWarehouse, items, paymentTerms, notes, taxRate } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'PO must have at least one line item.' });
    }

    let subtotal = 0;
    const computedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ success: false, message: `Invalid product ID: ${item.product}` });
      }
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice || product.unitPrice);
      const lineTotal = quantity * unitPrice;
      subtotal += lineTotal;

      computedItems.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        quantity,
        unitPrice,
        total: lineTotal,
      });
    }

    const appliedTaxRate = taxRate !== undefined ? Number(taxRate) : 5;
    const taxAmount = (subtotal * appliedTaxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    const poNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const po = await PurchaseOrder.create({
      poNumber,
      supplier,
      targetWarehouse,
      items: computedItems,
      subtotal,
      taxRate: appliedTaxRate,
      taxAmount,
      totalAmount,
      status: 'DRAFT',
      createdBy: req.user?._id || null,
      paymentTerms: paymentTerms || 'Net 30',
      notes: notes || '',
    });

    const populatedPO = await PurchaseOrder.findById(po._id)
      .populate('targetWarehouse')
      .populate('createdBy', 'name email')
      .populate('items.product');

    res.status(201).json({ success: true, data: populatedPO });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const { status, warehouseId } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (warehouseId && warehouseId !== 'All') query.targetWarehouse = warehouseId;

    const pos = await PurchaseOrder.find(query)
      .populate('targetWarehouse')
      .populate('createdBy', 'name email role')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pos.length, data: pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('targetWarehouse')
      .populate('createdBy', 'name email role')
      .populate('items.product');

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const po = await PurchaseOrder.findById(id).populate('items.product');
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    const previousStatus = po.status;
    po.status = status;

    // If transitioned to RECEIVED, credit warehouse stock for each item
    if (status === 'RECEIVED' && previousStatus !== 'RECEIVED') {
      po.receivedDate = new Date();

      for (const item of po.items) {
        let stock = await Stock.findOne({
          product: item.product._id,
          warehouse: po.targetWarehouse,
        });

        if (!stock) {
          stock = new Stock({
            product: item.product._id,
            warehouse: po.targetWarehouse,
            quantity: item.quantity,
            reorderLevel: item.product.minStockAlert || 15,
          });
        } else {
          stock.quantity += item.quantity;
          stock.lastUpdated = new Date();
        }
        await stock.save();

        // Create transaction entry for Goods Receipt
        await Transaction.create({
          transactionNumber: `RCP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'RECEIPT',
          product: item.product._id,
          toWarehouse: po.targetWarehouse,
          quantity: item.quantity,
          referenceDoc: po.poNumber,
          performedBy: req.user?._id || null,
          notes: `Goods Received against PO ${po.poNumber}`,
          status: 'COMPLETED',
        });
      }
    }

    await po.save();

    const updatedPO = await PurchaseOrder.findById(id)
      .populate('targetWarehouse')
      .populate('createdBy', 'name email role')
      .populate('items.product');

    res.json({ success: true, message: `PO status updated to ${status}`, data: updatedPO });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
