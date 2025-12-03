import cron from 'node-cron';
import { collectJobsStatus } from './jobs-status-collector.service';

export function startJobsStatusCollectorCron(): void {
  cron.schedule('*/1 * * * *', async () => {
    try {
      await collectJobsStatus();
    } catch (error) {
      console.error('❌ Error en recolección de estado de jobs:', error);
    }
  });
}
