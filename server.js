//server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); // ⬅️ CORRECCIÓN #1: Importar Mongoose para poder usar mongoose.connection
const { connectDB } = require('./src/config/database'); // Mantener la importación de la función de conexión

const app = express();
// Se utiliza la lógica de puerto corregida para funcionar en local (4000) o en la nube (process.env.PORT)
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos
connectDB();
const testRoutes = require('./src/routes/test.routes');
app.use('/api', testRoutes);

// Rutas básicas de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Servineo API',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Cerrar servidor gracefully
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing server gracefully');
  process.exit(0);
});