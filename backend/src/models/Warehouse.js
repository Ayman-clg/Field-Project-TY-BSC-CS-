import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    capacity: {
      type: Number,
      default: 10000,
    },
    contactPerson: {
      name: String,
      email: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Warehouse', warehouseSchema);
