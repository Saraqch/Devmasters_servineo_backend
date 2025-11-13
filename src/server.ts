import { SERVER_PORT } from './config/env.config';
import app from './app';
import { connectDatabase } from './config/db.config';
import { startJobsStatusCollectorCron } from './services/jobs-status-collector.cron';

async function startServer() {
  try {
    // 🔌 1️⃣ Conectamos a la base de datos antes de iniciar el servidor
    await connectDatabase();

    // 🚀 2️⃣ Iniciamos el servidor Express
    app.listen(SERVER_PORT, () => {
      console.info(`✅ Server running on http://localhost:${SERVER_PORT}`);
    });

    // 📊 3️⃣ Iniciamos el cron job para recolección de estado de jobs
    startJobsStatusCollectorCron();
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();
