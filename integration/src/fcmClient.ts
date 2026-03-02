/**
 * @file Client for sending push notifications via Firebase Cloud Messaging (FCM).
 */

import * as admin from 'firebase-admin';
import { FCMMessage } from './types';

/**
 * Configuration options for the FCMClient.
 */
export interface FCMClientConfig {
  serviceAccountKeyPath?: string; // Path to the Firebase service account key JSON file
  serviceAccountConfig?: admin.ServiceAccount; // Service account configuration object directly
}

/**
 * Client for sending Firebase Cloud Messaging (FCM) notifications.
 * Initializes the Firebase Admin SDK if not already initialized.
 */
export class FCMClient {
  private static isInitialized = false;

  constructor(config?: FCMClientConfig) {
    if (!FCMClient.isInitialized) {
      if (!config || (!config.serviceAccountKeyPath && !config.serviceAccountConfig)) {
        throw new Error(
          'FCMClient: Service account key path or config is required for Firebase Admin SDK initialization.',
        );
      }

      try {
        admin.initializeApp({
          credential: admin.credential.cert(
            config.serviceAccountKeyPath || (config.serviceAccountConfig as admin.ServiceAccount),
          ),
        });
        FCMClient.isInitialized = true;
        console.log('FCMClient: Firebase Admin SDK initialized successfully.');
      } catch (error) {
        if ((error as Error).message.includes('The default Firebase app already exists.')) {
          // This can happen in test environments where modules are reloaded
          console.warn('FCMClient: Firebase Admin SDK already initialized. Skipping re-initialization.');
          FCMClient.isInitialized = true;
        } else {
          throw new Error(`FCMClient: Failed to initialize Firebase Admin SDK: ${(error as Error).message}`);
        }
      }
    }
  }

  /**
   * Sends a single FCM push notification.
   * @param message The FCM message payload.
   * @returns A promise that resolves to the FCM message ID on success.
   * @throws Error if the message is invalid or FCM sending fails.
   */
  public async sendNotification(message: FCMMessage): Promise<string> {
    if (!message || !message.token || !message.notification || !message.notification.title || !message.notification.body) {
      throw new Error('FCMClient: Invalid FCM message payload. Missing token, title, or body.');
    }

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      // Firebase Admin SDK errors often have a 'code' property
      const errorCode = (error as any).code || 'unknown-error';
      const errorMessage = (error as Error).message || 'An unknown error occurred during FCM send.';

      // Log specific FCM errors for better debugging
      console.error(`FCMClient: Failed to send notification to token ${message.token}: [${errorCode}] ${errorMessage}`);

      // Re-throw with a more descriptive error for the caller
      throw new Error(`FCM sending failed for token ${message.token}: [${errorCode}] ${errorMessage}`);
    }
  }
}
