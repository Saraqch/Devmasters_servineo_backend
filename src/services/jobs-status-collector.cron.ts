import cron from 'node-cron';
import { collectJobsStatus } from './jobs-status-collector.service';

export function startJobsStatusCollectorCron(): void {
  cron.schedule('*/1 * * * *', async () => {
    try {
      console.log('🔄 Ejecutando recolección de estado de jobs...');
      await collectJobsStatus();
      console.log('✅ Recolección de estado de jobs completada');
    } catch (error) {
      console.error('❌ Error en recolección de estado de jobs:', error);
    }
  });

  console.log('✅ Cron job de recolección de estado de jobs iniciado (cada 10 minutos)');
}
