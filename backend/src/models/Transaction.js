import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['TRANSFER', 'RECEIPT', 'DISPATCH', 'ADJUSTMENT', 'INITIAL'],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    referenceDoc: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'CANCELLED'],
      default: 'COMPLETED',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
