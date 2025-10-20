// src/index.ts
// Cargar variables de entorno lo antes posible
import 'dotenv/config';

import Server from './config/server.config';
import { connectDatabase } from './config/db.config';

(async () => {
  try {
    await connectDatabase();
    console.log('📡 Base de datos lista');
  } catch (error) {
    console.error('❌ Error al conectar DB en arranque:', error);
    // No hacemos process.exit ni cierres forzados
  }
})();

export default Server;
