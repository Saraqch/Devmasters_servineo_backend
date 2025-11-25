// src/config/db.config.ts
import mongoose from 'mongoose';
import { appConfig } from './app.config';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(appConfig.mongoUri);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

// Eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('💥 Error en MongoDB:', err);
});

// Cerrar conexión cuando la app termina
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Conexión MongoDB cerrada por terminación de app');
  process.exit(0);
});

//crear afuera un archivo llamado test-conn para verificacion de la conexion con la bd
