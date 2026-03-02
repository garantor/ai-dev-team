/**
 * @file Contract tests for the NotificationService.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from '../src/notificationService';
import { SchedulingApiClient } from '../src/schedulingApiClient';
import { FCMClient } from '../src/fcmClient';
import { ScheduledWorkout, NotificationSummary } from '../src/types';

// Mock dependencies
const mockSchedulingApiClient = {
  getUpcomingWorkouts: vi.fn(),
} as unknown as SchedulingApiClient;

const mockFCMClient = {
  sendNotification: vi.fn(),
} as unknown as FCMClient;

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NotificationService(mockSchedulingApiClient, mockFCMClient);
  });

  it('should be initialized with valid clients', () => {
    expect(() => new NotificationService(null as any, mockFCMClient)).toThrow(
      'NotificationService: SchedulingApiClient instance is required.',
    );
    expect(() => new NotificationService(mockSchedulingApiClient, null as any)).toThrow(
      'NotificationService: FCMClient instance is required.',
    );
    expect(service).toBeInstanceOf(NotificationService);
  });

  describe('sendWorkoutReminders', () => {
    const mockWorkouts: ScheduledWorkout[] = [
      {
        id: 'w1',
        userId: 'u1',
        title: 'Morning Yoga',
        description: 'Stretch and relax.',
        startTime: new Date().toISOString(),
        notificationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        deviceToken: 'fcm-token-1',
      },
      {
        id: 'w2',
        userId: 'u2',
        title: 'Evening Run',
        description: 'Get your cardio in!',
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        notificationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        deviceToken: 'fcm-token-2',
      },
      {
        id: 'w3',
        userId: 'u3',
        title: 'Weightlifting',
        startTime: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
        notificationTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        deviceToken: 'fcm-token-3',
      },
    ];

    it('should successfully send reminders for all upcoming workouts', async () => {
      (mockSchedulingApiClient.getUpcomingWorkouts as vi.Mock).mockResolvedValue(mockWorkouts);
      (mockFCMClient.sendNotification as vi.Mock)
        .mockResolvedValueOnce('msg-id-1')
        .mockResolvedValueOnce('msg-id-2')
        .mockResolvedValueOnce('msg-id-3');

      const summary = await service.sendWorkoutReminders(30);

      expect(mockSchedulingApiClient.getUpcomingWorkouts).toHaveBeenCalledWith(30);
      expect(mockFCMClient.sendNotification).toHaveBeenCalledTimes(3);
      expect(mockFCMClient.sendNotification).toHaveBeenCalledWith({
        token: 'fcm-token-1',
        notification: { title: 'Workout Reminder: Morning Yoga', body: 'Stretch and relax.' },
        data: { workoutId: 'w1', userId: 'u1', startTime: mockWorkouts[0].startTime },
      });
      expect(mockFCMClient.sendNotification).toHaveBeenCalledWith({
        token: 'fcm-token-2',
        notification: { title: 'Workout Reminder: Evening Run', body: 'Get your cardio in!' },
        data: { workoutId: 'w2', userId: 'u2', startTime: mockWorkouts[1].startTime },
      });
      expect(mockFCMClient.sendNotification).toHaveBeenCalledWith({
        token: 'fcm-token-3',
        notification: { title: 'Workout Reminder: Weightlifting', body: 'Your workout \'Weightlifting\' is starting soon!' },
        data: { workoutId: 'w3', userId: 'u3', startTime: mockWorkouts[2].startTime },
      });

      expect(summary).toEqual<NotificationSummary>({
        totalWorkouts: 3,
        notificationsSent: 3,
        notificationsFailed: 0,
        results: [
          { workoutId: 'w1', userId: 'u1', status: 'success', messageId: 'msg-id-1' },
          { workoutId: 'w2', userId: 'u2', status: 'success', messageId: 'msg-id-2' },
          { workoutId: 'w3', userId: 'u3', status: 'success', messageId: 'msg-id-3' },
        ],
      });
    });

    it('should handle cases where no upcoming workouts are found', async () => {
      (mockSchedulingApiClient.getUpcomingWorkouts as vi.Mock).mockResolvedValue([]);

      const summary = await service.sendWorkoutReminders(30);

      expect(mockSchedulingApiClient.getUpcomingWorkouts).toHaveBeenCalledWith(30);
      expect(mockFCMClient.sendNotification).not.toHaveBeenCalled();
      expect(summary).toEqual<NotificationSummary>({
        totalWorkouts: 0,
        notificationsSent: 0,
        notificationsFailed: 0,
        results: [],
      });
    });

    it('should handle errors when fetching upcoming workouts', async () => {
      const fetchError = new Error('API is down');
      (mockSchedulingApiClient.getUpcomingWorkouts as vi.Mock).mockRejectedValue(fetchError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const summary = await service.sendWorkoutReminders(30);

      expect(mockSchedulingApiClient.getUpcomingWorkouts).toHaveBeenCalledWith(30);
      expect(mockFCMClient.sendNotification).not.toHaveBeenCalled();
      expect(summary).toEqual<NotificationSummary>({
        totalWorkouts: 0,
        notificationsSent: 0,
        notificationsFailed: 0,
        results: [],
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `NotificationService: Failed to fetch upcoming workouts: ${fetchError.message}`,
      );
      consoleErrorSpy.mockRestore();
    });

    it('should continue sending notifications even if some fail', async () => {
      (mockSchedulingApiClient.getUpcomingWorkouts as vi.Mock).mockResolvedValue(mockWorkouts);
      (mockFCMClient.sendNotification as vi.Mock)
        .mockResolvedValueOnce('msg-id-1') // Workout 1 succeeds
        .mockRejectedValueOnce(new Error('Invalid FCM token')) // Workout 2 fails
        .mockResolvedValueOnce('msg-id-3'); // Workout 3 succeeds

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const summary = await service.sendWorkoutReminders(30);

      expect(mockSchedulingApiClient.getUpcomingWorkouts).toHaveBeenCalledWith(30);
      expect(mockFCMClient.sendNotification).toHaveBeenCalledTimes(3);

      expect(summary).toEqual<NotificationSummary>({
        totalWorkouts: 3,
        notificationsSent: 2,
        notificationsFailed: 1,
        results: [
          { workoutId: 'w1', userId: 'u1', status: 'success', messageId: 'msg-id-1' },
          {
            workoutId: 'w2',
            userId: 'u2',
            status: 'failure',
            error: 'FCM sending failed for token fcm-token-2: [unknown-error] Invalid FCM token',
          },
          { workoutId: 'w3', userId: 'u3', status: 'success', messageId: 'msg-id-3' },
        ],
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('NotificationService: Failed to send notification for workout w2 to user u2:'),
      );
      consoleErrorSpy.mockRestore();
    });

    it('should throw an error for invalid lookAheadMinutes', async () => {
      await expect(service.sendWorkoutReminders(0)).rejects.toThrow(
        'sendWorkoutReminders: lookAheadMinutes must be a positive number.',
      );
      await expect(service.sendWorkoutReminders(-10)).rejects.toThrow(
        'sendWorkoutReminders: lookAheadMinutes must be a positive number.',
      );
    });
  });
});
