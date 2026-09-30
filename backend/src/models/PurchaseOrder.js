import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sku: String,
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },
    supplier: {
      name: { type: String, required: true },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    targetWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    items: [poItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 5, // 5% default
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CANCELLED'],
      default: 'DRAFT',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expectedDeliveryDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    },
    receivedDate: {
      type: Date,
      default: null,
    },
    paymentTerms: {
      type: String,
      default: 'Net 30',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
