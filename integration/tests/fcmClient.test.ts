/**
 * @file Contract tests for the FCMClient.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FCMClient, FCMClientConfig } from '../src/fcmClient';
import { FCMMessage } from '../src/types';
import * as admin from 'firebase-admin';

// Mock firebase-admin
vi.mock('firebase-admin', async (importOriginal) => {
  const actual = await importOriginal();
  const mockMessaging = {
    send: vi.fn(),
  };
  return {
    ...actual,
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn(() => 'mock-credential'),
    },
    messaging: vi.fn(() => mockMessaging),
  };
});

describe('FCMClient', () => {
  const mockServiceAccountConfig: admin.ServiceAccount = {
    projectId: 'test-project',
    clientEmail: 'test@test.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\nTEST_KEY\n-----END PRIVATE KEY-----\n',
  };
  const config: FCMClientConfig = { serviceAccountConfig: mockServiceAccountConfig };
  let client: FCMClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure isInitialized is reset for each test if it's a static property
    (FCMClient as any).isInitialized = false;
    client = new FCMClient(config);
  });

  it('should initialize Firebase Admin SDK once', () => {
    expect(admin.initializeApp).toHaveBeenCalledTimes(1);
    expect(admin.credential.cert).toHaveBeenCalledWith(mockServiceAccountConfig);
    // Subsequent instantiation should not re-initialize
    new FCMClient(config);
    expect(admin.initializeApp).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if service account config is missing on first initialization', () => {
    (FCMClient as any).isInitialized = false; // Reset for this specific test
    expect(() => new FCMClient()).toThrow(
      'FCMClient: Service account key path or config is required for Firebase Admin SDK initialization.',
    );
  });

  it('should handle existing Firebase app gracefully', () => {
    (FCMClient as any).isInitialized = false;
    (admin.initializeApp as vi.Mock).mockImplementationOnce(() => {
      throw new Error('The default Firebase app already exists.');
    });
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    new FCMClient(config);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'FCMClient: Firebase Admin SDK already initialized. Skipping re-initialization.',
    );
    consoleWarnSpy.mockRestore();
  });

  describe('sendNotification', () => {
    const mockMessage: FCMMessage = {
      token: 'mock-fcm-token',
      notification: {
        title: 'Workout Reminder',
        body: 'Time to hit the gym!',
      },
      data: {
        workoutId: 'w123',
      },
    };

    it('should send a notification successfully and return message ID', async () => {
      const mockMessageId = 'projects/test-project/messages/12345';
      (admin.messaging().send as vi.Mock).mockResolvedValueOnce(mockMessageId);

      const result = await client.sendNotification(mockMessage);

      expect(admin.messaging().send).toHaveBeenCalledWith(mockMessage);
      expect(result).toBe(mockMessageId);
    });

    it('should throw an error for invalid message payload (missing token)', async () => {
      const invalidMessage = { ...mockMessage, token: '' };
      await expect(client.sendNotification(invalidMessage)).rejects.toThrow(
        'FCMClient: Invalid FCM message payload. Missing token, title, or body.',
      );
    });

    it('should throw an error for invalid message payload (missing title)', async () => {
      const invalidMessage = { ...mockMessage, notification: { body: 'body' } } as FCMMessage;
      await expect(client.sendNotification(invalidMessage)).rejects.toThrow(
        'FCMClient: Invalid FCM message payload. Missing token, title, or body.',
      );
    });

    it('should throw an error for invalid message payload (missing body)', async () => {
      const invalidMessage = { ...mockMessage, notification: { title: 'title' } } as FCMMessage;
      await expect(client.sendNotification(invalidMessage)).rejects.toThrow(
        'FCMClient: Invalid FCM message payload. Missing token, title, or body.',
      );
    });

    it('should throw an error if FCM sending fails', async () => {
      const fcmError = new Error('Invalid registration token');
      (fcmError as any).code = 'messaging/invalid-registration-token';
      (admin.messaging().send as vi.Mock).mockRejectedValueOnce(fcmError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(client.sendNotification(mockMessage)).rejects.toThrow(
        `FCM sending failed for token ${mockMessage.token}: [messaging/invalid-registration-token] Invalid registration token`,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `FCMClient: Failed to send notification to token ${mockMessage.token}: [messaging/invalid-registration-token] Invalid registration token`,
      );
      consoleErrorSpy.mockRestore();
    });

    it('should throw a generic error if FCM sending fails with unknown error', async () => {
      const unknownError = new Error('Something went wrong');
      (admin.messaging().send as vi.Mock).mockRejectedValueOnce(unknownError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(client.sendNotification(mockMessage)).rejects.toThrow(
        `FCM sending failed for token ${mockMessage.token}: [unknown-error] Something went wrong`,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `FCMClient: Failed to send notification to token ${mockMessage.token}: [unknown-error] Something went wrong`,
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
