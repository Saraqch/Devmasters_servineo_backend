/**
 * Notification payload type definition for communication channels
 */
export interface NotificationPayload {
  channel?: string;
  message?: string;
  [key: string]: any;
}
