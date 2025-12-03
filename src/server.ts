import { SERVER_PORT } from './config/env.config';
import app from './app';
import { connectDatabase } from './config/db.config';
import { connectDB } from './config/db/mongoClient';
import { startJobsStatusCollectorCron } from './services/jobs-status-collector.cron';

async function startServer() {
  try {
    await connectDatabase();
    await connectDB();

    app.listen(SERVER_PORT, () => {
      const url = `http://localhost:${SERVER_PORT}`;
      console.info(`✅ Server running on ${url}`);
    });

    startJobsStatusCollectorCron();
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
