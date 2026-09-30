import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      default: 'General',
    },
    unit: {
      type: String,
      default: 'Units',
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockAlert: {
      type: Number,
      default: 20,
    },
    barcode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Discontinued'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
