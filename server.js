const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure DB is initialized
const { db, DB_PATH } = require('./src/db');

// Route modules
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const masterRoutes = require('./src/routes/masterRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const maintenanceRoutes = require('./src/routes/maintenanceRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const { router: docsRoutes, openApiSpec } = require('./src/routes/docsRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend
const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
app.use(express.static(PUBLIC_DIR));

// API Routers
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/docs', docsRoutes);

// Interactive Swagger / OpenAPI Documentation View
app.get('/docs', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'docs.html'));
});

// SPA Fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Endpoint API tidak ditemukan.' });
  }
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const DEFAULT_PORT = process.env.PORT || 3000;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚀 Aurora Aset siap digunakan!`);
    console.log(`🌐 Port / Socket:     ${port}`);
    console.log(`📚 Dokumentasi API:   /docs`);
    console.log(`🗄️ Database SQLite:   ${DB_PATH}`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} sedang terpakai, mencoba port ${Number(port) + 1}...`);
      startServer(Number(port) + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);

module.exports = app;
