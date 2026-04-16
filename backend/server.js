const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { initSocket } = require('./config/socket');

// BUG-B FIX: Validate critical environment variables at startup.
// If JWT_SECRET is missing, jwt.sign() uses the string 'undefined' as the secret,
// meaning ALL tokens share the same trivially-known 'secret'. This is catastrophic.
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('   Please check your .env file. Exiting.');
  process.exit(1);
}

// Route imports
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');
const itemRoutes = require('./routes/items');
const claimRoutes = require('./routes/claims');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  },
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
// BUG-C FIX: Reduced JSON limit from 10mb to 100kb.
// A 10mb JSON body is a memory-spike attack vector. File uploads go through
// multer (with its own limits), so the JSON parser never needs more than ~100kb.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Lost & Found API - Multi College Edition',
    version: '2.0.0',
    endpoints: {
      colleges: {
        list: 'GET /api/colleges',
        single: 'GET /api/colleges/:slug',
        register: 'POST /api/colleges/register',
        update: 'PUT /api/colleges/:id',
        stats: 'GET /api/colleges/:id/stats',
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
      },
      items: {
        list: 'GET /api/items',
        single: 'GET /api/items/:id',
        create: 'POST /api/items',
        myItems: 'GET /api/items/user/my-items',
      },
      claims: {
        create: 'POST /api/claims',
        myClaims: 'GET /api/claims/my-claims',
      },
    },
  });
});

// Handle 404 - Route not found
app.use(notFound);

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}
📍 Health check: http://localhost:${PORT}/health
📚 API docs: http://localhost:${PORT}/api
  `);
});

// Initialize Socket.io with the running HTTP server
initSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;