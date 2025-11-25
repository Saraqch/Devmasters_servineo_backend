// Simple proveedor de notificaciones en modo PRUEBA (solo log a consola)
import { NotificationPayload } from '../../domain/channels';

export class ConsoleProvider {
  async send(p: NotificationPayload): Promise<void> {
    console.log('[NOTIFY:SANDBOX]', JSON.stringify(p));
  }
}
