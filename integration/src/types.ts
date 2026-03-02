/**
 * @file Defines common types used across the integration module.
 */

/**
 * Represents a scheduled workout fetched from the backend scheduling API.
 */
export interface ScheduledWorkout {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601 string
  notificationTime: string; // ISO 8601 string - when to send the reminder
  deviceToken: string; // FCM registration token for the user's device
}

/**
 * Represents the structure of an FCM message payload.
 * This aligns with the `firebase-admin` SDK's `Message` interface.
 */
export interface FCMMessage {
  token: string; // The FCM registration token for the target device.
  notification: {
    title: string;
    body: string;
  };
  data?: { [key: string]: string }; // Optional custom data key-value pairs.
  // Other FCM message options like `android`, `apns`, `webpush` could be added here if needed.
}

/**
 * Represents the result of sending a single FCM notification.
 */
export interface NotificationResult {
  workoutId: string;
  userId: string;
  status: 'success' | 'failure';
  messageId?: string; // FCM message ID on success
  error?: string; // Error message on failure
}

/**
 * Represents the summary of a batch notification sending operation.
 */
export interface NotificationSummary {
  totalWorkouts: number;
  notificationsSent: number;
  notificationsFailed: number;
  results: NotificationResult[];
}
