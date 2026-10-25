const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const requireDatabase = require('./middleware/requireDatabase');
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');
const csrfProtection = require('./middleware/csrfProtection');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const allowedOrigin = new URL(process.env.CLIENT_URL || 'http://localhost:5173').origin;
const databaseReconnectDelay = 30000;

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);
app.use(
  '/uploads',
  (req, res, next) => {
    if (req.query.download === '1') res.attachment(path.basename(req.path));
    next();
  },
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',
    index: false,
    fallthrough: false,
  }),
);
app.use('/api', csrfProtection(allowedOrigin));

app.get(['/', '/health'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ISM backend is running ✅',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  return res.status(connected ? 200 : 503).json({
    success: connected,
    status: connected ? 'ok' : 'degraded',
    server: 'running',
    database: {
      connected,
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/content', requireDatabase, contentRoutes);
app.use('/api/contact', requireDatabase, contactRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

async function startServer() {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server on port ${PORT}`);
  });

  connectDB().catch((error) => {
    console.error(`Database connection failed; server is running in degraded mode: ${error.message}`);
    scheduleDatabaseReconnect();
  });

  return server;
}

function scheduleDatabaseReconnect() {
  const retry = setTimeout(() => {
    connectDB().catch((error) => {
      console.error(`Database reconnection failed: ${error.message}`);
      scheduleDatabaseReconnect();
    });
  }, databaseReconnectDelay);
  retry.unref();
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
