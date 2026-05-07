/**
 * PHASE 2: AI Weather Chatbot - Production Backend
 * Express server with MongoDB integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import chatRoutes from './routes/chatRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-chatbot';

// ============================================================================
// SECURITY & MIDDLEWARE
// ============================================================================

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✓ MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('✗ MongoDB connection error:', err.message);
        process.exit(1);
    });

// ============================================================================
// ROUTES
// ============================================================================

app.use('/api/chat', chatRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║     AI Weather Chatbot - Phase 2 (Production Backend)         ║
║                                                                ║
║  Server running at: http://localhost:${PORT}                   ║
║  MongoDB: ${MONGODB_URI}                    ║
║                                                                ║
║  Endpoints:                                                   ║
║  POST   /api/chat/message      - Send message to chatbot      ║
║  GET    /api/locations         - Get saved locations          ║
║  POST   /api/locations         - Save a new location          ║
║  GET    /api/history/:userId   - Get search history           ║
║  GET    /api/health            - Health check                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;