import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Warehouse from '../models/Warehouse.js';
import Product from '../models/Product.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enterprise_inventory';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Seeder] Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Warehouse.deleteMany({}),
      Product.deleteMany({}),
      Stock.deleteMany({}),
      Transaction.deleteMany({}),
      PurchaseOrder.deleteMany({}),
    ]);

    console.log('[Seeder] Inserting Warehouses...');
    const warehouses = await Warehouse.insertMany([
      {
        name: 'Central Distribution Hub',
        code: 'WH-CHI',
        location: 'Chicago, IL',
        capacity: 25000,
        contactPerson: { name: 'David Miller', email: 'd.miller@apex.com', phone: '+1-312-555-0190' },
        status: 'Active',
      },
      {
        name: 'West Coast Logistics Center',
        code: 'WH-LAX',
        location: 'Los Angeles, CA',
        capacity: 18000,
        contactPerson: { name: 'Elena Rodriguez', email: 'e.rodriguez@apex.com', phone: '+1-213-555-0144' },
        status: 'Active',
      },
      {
        name: 'East Coast Port Facility',
        code: 'WH-EWR',
        location: 'Newark, NJ',
        capacity: 20000,
        contactPerson: { name: 'Marcus Vance', email: 'm.vance@apex.com', phone: '+1-973-555-0182' },
        status: 'Active',
      },
      {
        name: 'Euro-Gateway Depot',
        code: 'WH-RTM',
        location: 'Rotterdam, NL',
        capacity: 15000,
        contactPerson: { name: 'Anke Van Dijk', email: 'a.vandijk@apex.com', phone: '+31-10-555-0199' },
        status: 'Active',
      },
    ]);

    console.log('[Seeder] Inserting Users...');
    const users = await User.create([
      {
        name: 'Sarah Connor',
        email: 'admin@apex.com',
        password: 'password123',
        role: 'Admin',
        status: 'Active',
      },
      {
        name: 'Michael Scott',
        email: 'manager@apex.com',
        password: 'password123',
        role: 'Manager',
        assignedWarehouse: warehouses[0]._id,
        status: 'Active',
      },
      {
        name: 'Jim Halpert',
        email: 'clerk@apex.com',
        password: 'password123',
        role: 'Clerk',
        assignedWarehouse: warehouses[1]._id,
        status: 'Active',
      },
    ]);

    console.log('[Seeder] Inserting Products...');
    const products = await Product.insertMany([
      {
        sku: 'MTR-AC-400V',
        name: 'Industrial Three-Phase AC Motor 400V',
        description: 'Heavy duty brushless continuous duty industrial drive',
        category: 'Motors & Actuators',
        unit: 'Units',
        unitPrice: 480.0,
        minStockAlert: 20,
      },
      {
        sku: 'MCU-ARM-C9',
        name: 'ARM Cortex-M9 Real-Time Industrial Controller',
        description: 'Ultra-low latency dual-core CAN/Modbus controller board',
        category: 'Electronics',
        unit: 'Units',
        unitPrice: 85.5,
        minStockAlert: 35,
      },
      {
        sku: 'COP-WIR-10AWG',
        name: 'High-Purity OFC Copper Wire 10 AWG (500m Spool)',
        description: 'Flam-resistant insulated stranded cable for power systems',
        category: 'Raw Materials',
        unit: 'Spools',
        unitPrice: 220.0,
        minStockAlert: 15,
      },
      {
        sku: 'BAT-LFP-48V',
        name: 'LiFePO4 Modular Energy Storage Pack 48V 100Ah',
        description: 'High lifecycle prismatic cells with internal BMS',
        category: 'Energy Storage',
        unit: 'Units',
        unitPrice: 890.0,
        minStockAlert: 10,
      },
      {
        sku: 'VAL-HYD-5000',
        name: 'Electro-Hydraulic Directional Proportional Valve',
        description: 'Precision hydraulic flow control with digital feedback',
        category: 'Hydraulics',
        unit: 'Units',
        unitPrice: 340.0,
        minStockAlert: 25,
      },
      {
        sku: 'SNS-OPT-LIDAR',
        name: 'Multi-Beam Solid State LiDAR Rangefinder 50m',
        description: 'Optical distance sensor for automated AGVs & gantry cranes',
        category: 'Sensors',
        unit: 'Units',
        unitPrice: 620.0,
        minStockAlert: 12,
      },
      {
        sku: 'FST-GR8-M12',
        name: 'Grade 8.8 Galvanized Flange Hex Bolts M12 (Box of 200)',
        description: 'High tensile structural grade mechanical fasteners',
        category: 'Hardware',
        unit: 'Boxes',
        unitPrice: 45.0,
        minStockAlert: 50,
      },
    ]);

    console.log('[Seeder] Distributing Stock Across Warehouses...');
    const stocks = await Stock.insertMany([
      // Central Distribution (WH-CHI)
      { product: products[0]._id, warehouse: warehouses[0]._id, quantity: 45, reorderLevel: 20 },
      { product: products[1]._id, warehouse: warehouses[0]._id, quantity: 180, reorderLevel: 35 },
      { product: products[2]._id, warehouse: warehouses[0]._id, quantity: 30, reorderLevel: 15 },
      { product: products[3]._id, warehouse: warehouses[0]._id, quantity: 24, reorderLevel: 10 },
      { product: products[4]._id, warehouse: warehouses[0]._id, quantity: 65, reorderLevel: 25 },
      { product: products[5]._id, warehouse: warehouses[0]._id, quantity: 18, reorderLevel: 12 },
      { product: products[6]._id, warehouse: warehouses[0]._id, quantity: 140, reorderLevel: 50 },

      // West Coast (WH-LAX)
      { product: products[0]._id, warehouse: warehouses[1]._id, quantity: 12, reorderLevel: 20 }, // Low stock!
      { product: products[1]._id, warehouse: warehouses[1]._id, quantity: 95, reorderLevel: 35 },
      { product: products[2]._id, warehouse: warehouses[1]._id, quantity: 8, reorderLevel: 15 }, // Low stock!
      { product: products[3]._id, warehouse: warehouses[1]._id, quantity: 15, reorderLevel: 10 },
      { product: products[4]._id, warehouse: warehouses[1]._id, quantity: 8, reorderLevel: 25 }, // Low stock!
      { product: products[5]._id, warehouse: warehouses[1]._id, quantity: 5, reorderLevel: 12 }, // Low stock!
      { product: products[6]._id, warehouse: warehouses[1]._id, quantity: 80, reorderLevel: 50 },

      // East Coast (WH-EWR)
      { product: products[0]._id, warehouse: warehouses[2]._id, quantity: 28, reorderLevel: 20 },
      { product: products[1]._id, warehouse: warehouses[2]._id, quantity: 40, reorderLevel: 35 },
      { product: products[2]._id, warehouse: warehouses[2]._id, quantity: 22, reorderLevel: 15 },
      { product: products[3]._id, warehouse: warehouses[2]._id, quantity: 12, reorderLevel: 10 },
      { product: products[4]._id, warehouse: warehouses[2]._id, quantity: 32, reorderLevel: 25 },
      { product: products[5]._id, warehouse: warehouses[2]._id, quantity: 16, reorderLevel: 12 },
      { product: products[6]._id, warehouse: warehouses[2]._id, quantity: 60, reorderLevel: 50 },

      // Rotterdam (WH-RTM)
      { product: products[0]._id, warehouse: warehouses[3]._id, quantity: 15, reorderLevel: 20 }, // Low stock!
      { product: products[1]._id, warehouse: warehouses[3]._id, quantity: 70, reorderLevel: 35 },
      { product: products[3]._id, warehouse: warehouses[3]._id, quantity: 18, reorderLevel: 10 },
      { product: products[5]._id, warehouse: warehouses[3]._id, quantity: 9, reorderLevel: 12 }, // Low stock!
    ]);

    console.log('[Seeder] Creating Sample Transfer & Receipt Transactions...');
    await Transaction.insertMany([
      {
        transactionNumber: `TRF-2026-8801`,
        type: 'TRANSFER',
        product: products[0]._id,
        fromWarehouse: warehouses[0]._id,
        toWarehouse: warehouses[1]._id,
        quantity: 15,
        performedBy: users[0]._id,
        status: 'COMPLETED',
        notes: 'Replenishment transfer from Central Hub to West Coast Logistics',
      },
      {
        transactionNumber: `RCP-2026-1044`,
        type: 'RECEIPT',
        product: products[3]._id,
        toWarehouse: warehouses[0]._id,
        quantity: 20,
        referenceDoc: 'PO-77401-2026',
        performedBy: users[1]._id,
        status: 'COMPLETED',
        notes: 'Inbound delivery from NovaVolt Energy Solutions',
      },
      {
        transactionNumber: `ADJ-2026-3021`,
        type: 'ADJUSTMENT',
        product: products[6]._id,
        toWarehouse: warehouses[2]._id,
        quantity: 10,
        performedBy: users[2]._id,
        status: 'COMPLETED',
        notes: 'Annual audit stock cycle count reconciliation',
      },
    ]);

    console.log('[Seeder] Creating Sample Purchase Orders...');
    await PurchaseOrder.insertMany([
      {
        poNumber: 'PO-2026-9011',
        supplier: {
          name: 'Apex Industrial Dynamics Inc.',
          email: 'sales@apexind.com',
          phone: '+1-800-555-4001',
          address: '742 Foundry Blvd, Detroit, MI 48201',
        },
        targetWarehouse: warehouses[0]._id,
        items: [
          {
            product: products[0]._id,
            sku: products[0].sku,
            name: products[0].name,
            quantity: 30,
            unitPrice: products[0].unitPrice,
            total: 30 * products[0].unitPrice,
          },
          {
            product: products[4]._id,
            sku: products[4].sku,
            name: products[4].name,
            quantity: 20,
            unitPrice: products[4].unitPrice,
            total: 20 * products[4].unitPrice,
          },
        ],
        subtotal: 30 * products[0].unitPrice + 20 * products[4].unitPrice,
        taxRate: 5,
        taxAmount: (30 * products[0].unitPrice + 20 * products[4].unitPrice) * 0.05,
        totalAmount: (30 * products[0].unitPrice + 20 * products[4].unitPrice) * 1.05,
        status: 'APPROVED',
        createdBy: users[0]._id,
        paymentTerms: 'Net 30',
        notes: 'Priority batch for Q4 fulfillment replenishment.',
      },
      {
        poNumber: 'PO-2026-9012',
        supplier: {
          name: 'NovaVolt High-Tech Batteries Corp',
          email: 'orders@novavolt.io',
          phone: '+1-415-555-8821',
          address: '100 Innovation Way, San Jose, CA 95110',
        },
        targetWarehouse: warehouses[1]._id,
        items: [
          {
            product: products[3]._id,
            sku: products[3].sku,
            name: products[3].name,
            quantity: 15,
            unitPrice: products[3].unitPrice,
            total: 15 * products[3].unitPrice,
          },
        ],
        subtotal: 15 * products[3].unitPrice,
        taxRate: 5,
        taxAmount: 15 * products[3].unitPrice * 0.05,
        totalAmount: 15 * products[3].unitPrice * 1.05,
        status: 'RECEIVED',
        receivedDate: new Date(),
        createdBy: users[1]._id,
        paymentTerms: 'Net 15',
        notes: 'Delivered and inspected at Bay 4.',
      },
    ]);

    console.log('[Seeder] Database seeded successfully with enterprise demo dataset!');
  } catch (error) {
    console.error('[Seeder Error]:', error);
  }
};

// If run directly via node seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
