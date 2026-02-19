const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Fail fast if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const userRoutes = require('./routes/users');
const emailRoutes = require('./routes/email');
const metadataRoutes = require('./routes/metadata');
const departmentRoutes = require('./routes/departments');
const activityTypeRoutes = require('./routes/activity-types');
const analyticsRoutes = require('./routes/analytics');
const reportsRoutes = require('./routes/reports');
const templateRoutes = require('./routes/templates');
const notificationRoutes = require('./routes/notifications');
const benchmarkRoutes = require('./routes/benchmarks');

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.tailwindcss.com",
        "https://unpkg.com",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.tailwindcss.com",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));
app.use(compression());
app.use(cors({
  origin: process.env.APP_URL || '*',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // increased for new features
});
app.use('/api/', limiter);

// Login-specific rate limiter (5 requests per minute)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many login attempts. Please try again in a minute.' }
});
app.use('/api/auth/login', loginLimiter);

// Serve static files
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/activity-types', activityTypeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/benchmarks', benchmarkRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve HTML pages
app.get('/calendar.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'calendar.html'));
});

app.get('/reports.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'reports.html'));
});

// Serve React app for all other routes (when built)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VIFM Activity Tracker Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);

  // Initialize cron jobs
  try {
    const { initWeeklyDigest } = require('./jobs/weekly-digest');
    initWeeklyDigest();
  } catch (error) {
    console.log('Weekly digest initialization skipped:', error.message);
  }
});

module.exports = app;
