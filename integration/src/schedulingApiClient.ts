/**
 * @file Client for interacting with the backend scheduling API.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { ScheduledWorkout } from './types';

/**
 * Configuration options for the SchedulingApiClient.
 */
export interface SchedulingApiClientConfig {
  baseUrl: string;
  apiKey?: string; // Optional API key for authentication
}

/**
 * Client for fetching scheduled workouts from the backend scheduling API.
 */
export class SchedulingApiClient {
  private axiosInstance: AxiosInstance;

  constructor(config: SchedulingApiClientConfig) {
    if (!config || !config.baseUrl) {
      throw new Error('SchedulingApiClient: baseUrl is required.');
    }
    if (!/^https?://[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})+(?::\d+)?(?:/.*)?$/.test(config.baseUrl)) {
      throw new Error('SchedulingApiClient: Invalid baseUrl format.');
    }

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
      },
      timeout: 5000, // 5 seconds timeout
    });
  }

  /**
   * Fetches upcoming workouts that are scheduled for notification within a specified time window.
   * @param lookAheadMinutes The number of minutes into the future to look for notifications.
   * @returns A promise that resolves to an array of ScheduledWorkout objects.
   * @throws Error if the API call fails or returns invalid data.
   */
  public async getUpcomingWorkouts(lookAheadMinutes: number): Promise<ScheduledWorkout[]> {
    if (typeof lookAheadMinutes !== 'number' || lookAheadMinutes <= 0) {
      throw new Error('lookAheadMinutes must be a positive number.');
    }

    try {
      const response = await this.axiosInstance.get<ScheduledWorkout[]>('/workouts/upcoming', {
        params: {
          lookAheadMinutes: lookAheadMinutes,
        },
      });

      // Basic validation of the response data structure
      if (!Array.isArray(response.data)) {
        throw new Error('Scheduling API returned an invalid data format (expected an array).');
      }

      // Further validate each workout object
      response.data.forEach((workout) => {
        if (
          !workout.id ||
          !workout.userId ||
          !workout.title ||
          !workout.startTime ||
          !workout.notificationTime ||
          !workout.deviceToken
        ) {
          console.warn('SchedulingApiClient: Received malformed workout data:', workout);
          // Optionally, filter out malformed data or throw a more specific error
        }
        // Validate date strings are valid ISO format
        if (isNaN(new Date(workout.startTime).getTime()) || isNaN(new Date(workout.notificationTime).getTime())) {
          console.warn('SchedulingApiClient: Received invalid date format in workout:', workout);
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response
          ? `Scheduling API error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`
          : `Scheduling API network error: ${axiosError.message}`;
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        throw new Error(`Scheduling API client error: ${error.message}`);
      } else {
        throw new Error(`An unknown error occurred while fetching upcoming workouts.`);
      }
    }
  }
}
