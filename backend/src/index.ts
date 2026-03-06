import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalyst from 'zcatalyst-sdk-node';
import { initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? /.*catalystapp\.io/ : '*',
  credentials: true
}));
app.use(express.json());

// Catalyst SDK middleware - attach app to request
app.use((req: any, res, next) => {
  req.zcatalystApp = catalyst.initialize(req);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const start = async () => {
  try {
    // Initialize database
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

