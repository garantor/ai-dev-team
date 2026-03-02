/**
 * @file Orchestrates the process of fetching scheduled workouts and sending FCM notifications.
 */

import { SchedulingApiClient } from './schedulingApiClient';
import { FCMClient } from './fcmClient';
import { ScheduledWorkout, FCMMessage, NotificationResult, NotificationSummary } from './types';

/**
 * Service responsible for coordinating between the scheduling API and FCM to send workout reminders.
 */
export class NotificationService {
  private schedulingApiClient: SchedulingApiClient;
  private fcmClient: FCMClient;

  constructor(schedulingApiClient: SchedulingApiClient, fcmClient: FCMClient) {
    if (!schedulingApiClient) {
      throw new Error('NotificationService: SchedulingApiClient instance is required.');
    }
    if (!fcmClient) {
      throw new Error('NotificationService: FCMClient instance is required.');
    }
    this.schedulingApiClient = schedulingApiClient;
    this.fcmClient = fcmClient;
  }

  /**
   * Fetches upcoming workouts and sends FCM reminders for them.
   * @param lookAheadMinutes The number of minutes into the future to look for notifications.
   * @returns A summary of the notification sending operation.
   */
  public async sendWorkoutReminders(lookAheadMinutes: number): Promise<NotificationSummary> {
    if (typeof lookAheadMinutes !== 'number' || lookAheadMinutes <= 0) {
      throw new Error('sendWorkoutReminders: lookAheadMinutes must be a positive number.');
    }

    console.log(`NotificationService: Fetching upcoming workouts for the next ${lookAheadMinutes} minutes...`);
    let workouts: ScheduledWorkout[] = [];
    try {
      workouts = await this.schedulingApiClient.getUpcomingWorkouts(lookAheadMinutes);
      console.log(`NotificationService: Found ${workouts.length} upcoming workouts.`);
    } catch (error) {
      console.error(
        `NotificationService: Failed to fetch upcoming workouts: ${(error as Error).message}`,
      );
      // If we can't fetch workouts, we can't send any notifications.
      return {
        totalWorkouts: 0,
        notificationsSent: 0,
        notificationsFailed: 0,
        results: [],
      };
    }

    const results: NotificationResult[] = [];
    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const workout of workouts) {
      const fcmMessage: FCMMessage = {
        token: workout.deviceToken,
        notification: {
          title: `Workout Reminder: ${workout.title}`,
          body: workout.description || `Your workout '${workout.title}' is starting soon!`, // Default body if description is missing
        },
        data: {
          workoutId: workout.id,
          userId: workout.userId,
          startTime: workout.startTime,
        },
      };

      try {
        console.log(`NotificationService: Attempting to send notification for workout ${workout.id} to user ${workout.userId}...`);
        const messageId = await this.fcmClient.sendNotification(fcmMessage);
        results.push({
          workoutId: workout.id,
          userId: workout.userId,
          status: 'success',
          messageId: messageId,
        });
        notificationsSent++;
        console.log(`NotificationService: Successfully sent notification for workout ${workout.id}. Message ID: ${messageId}`);
      } catch (error) {
        results.push({
          workoutId: workout.id,
          userId: workout.userId,
          status: 'failure',
          error: (error as Error).message,
        });
        notificationsFailed++;
        console.error(
          `NotificationService: Failed to send notification for workout ${workout.id} to user ${workout.userId}: ${(error as Error).message}`,
        );
      }
    }

    const summary: NotificationSummary = {
      totalWorkouts: workouts.length,
      notificationsSent: notificationsSent,
      notificationsFailed: notificationsFailed,
      results: results,
    };

    console.log('NotificationService: Workout reminder sending complete.', summary);
    return summary;
  }
}
