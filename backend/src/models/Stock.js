import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 15,
    },
    binLocation: {
      type: String,
      default: 'A1-01',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

stockSchema.index({ product: 1, warehouse: 1 }, { unique: true });

export default mongoose.model('Stock', stockSchema);
