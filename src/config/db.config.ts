// src/config/db.config.ts
import mongoose from 'mongoose';
import { appConfig } from './app.config';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log('⚡ MongoDB ya estaba conectado');
    return;
  }

  try {
    const conn = await mongoose.connect(appConfig.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = !!conn.connections[0].readyState;
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
};

if (process.env.NODE_ENV !== 'production') {
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB desconectado');
  });

  mongoose.connection.on('error', (err) => {
    console.error('💥 Error en MongoDB:', err);
  });
}
