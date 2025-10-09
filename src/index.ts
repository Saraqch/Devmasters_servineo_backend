// src/index.ts
import Server from './config/server.config';
import { SERVER_PORT } from './config/env.config';
import { connectDatabase } from './config/db.config';

async function startServer() {
  try {
    // 🔌 1️⃣ Conectamos a la base de datos antes de iniciar el servidor
    await connectDatabase();

    // 🚀 2️⃣ Iniciamos el servidor Express
    Server.listen(SERVER_PORT, () => {
      console.info(`✅ Server running on http://localhost:${SERVER_PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();
