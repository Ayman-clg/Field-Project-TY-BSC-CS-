import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { seedDatabase } from './utils/seedData.js';
import User from './models/User.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Landing Route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Apex SCM - Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
          h1 { margin-top: 0; color: #60a5fa; font-size: 24px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .btn { display: inline-block; margin-top: 20px; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
          .badge { display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
          .endpoints { text-align: left; background: #0f172a; border-radius: 8px; padding: 12px; margin-top: 20px; font-family: monospace; font-size: 12px; color: #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● API Server Online (Port 5000)</div>
          <h1>Apex SCM Enterprise API</h1>
          <p>This is the backend REST API service. To interact with the full inventory system, open the React frontend application.</p>
          <a href="http://localhost:5173" class="btn">🚀 Open Frontend UI (localhost:5173)</a>
          <div class="endpoints">
            <strong>Active API Endpoints:</strong><br/>
            • <code>/api/health</code> - Cluster Health<br/>
            • <code>/api/inventory/stock</code> - Multi-Warehouse Stock<br/>
            • <code>/api/transfers</code> - ACID Stock Movement<br/>
            • <code>/api/purchase-orders</code> - PO System<br/>
            • <code>/api/reports/po/:id/pdf</code> - PDF Streaming
          </div>
        </div>
      </body>
    </html>
  `);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Enterprise Multi-Location SCM API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed if database is freshly created without users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No users found. Auto-seeding initial enterprise dataset...');
      await seedDatabase();
    }
  } catch (error) {
    console.warn(`[Warning] Starting server with limited DB connection: ${error.message}`);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Enterprise SCM API Server running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();

export default app;
