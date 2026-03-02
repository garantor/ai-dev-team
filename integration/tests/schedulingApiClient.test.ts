/**
 * @file Contract tests for the SchedulingApiClient.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SchedulingApiClient, SchedulingApiClientConfig } from '../src/schedulingApiClient';
import { ScheduledWorkout } from '../src/types';
import axios from 'axios';

// Mock axios to control HTTP responses
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        get: vi.fn(),
      })),
    },
  };
});

const mockAxiosInstance = { get: vi.fn() };

describe('SchedulingApiClient', () => {
  const baseUrl = 'http://localhost:3000/api';
  const config: SchedulingApiClientConfig = { baseUrl };
  let client: SchedulingApiClient;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    (axios.create as any).mockReturnValue(mockAxiosInstance);
    client = new SchedulingApiClient(config);
  });

  it('should be initialized with a valid base URL', () => {
    expect(() => new SchedulingApiClient({ baseUrl: 'invalid-url' })).toThrow(
      'SchedulingApiClient: Invalid baseUrl format.',
    );
    expect(() => new SchedulingApiClient({ baseUrl: '' })).toThrow(
      'SchedulingApiClient: baseUrl is required.',
    );
    expect(() => new SchedulingApiClient({} as SchedulingApiClientConfig)).toThrow(
      'SchedulingApiClient: baseUrl is required.',
    );
    expect(client).toBeInstanceOf(SchedulingApiClient);
  });

  it('should include X-API-Key header if provided', () => {
    const clientWithApiKey = new SchedulingApiClient({ baseUrl, apiKey: 'test-key' });
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-key',
      },
      timeout: 5000,
    });
  });

  describe('getUpcomingWorkouts', () => {
    const mockWorkouts: ScheduledWorkout[] = [
      {
        id: 'w1',
        userId: 'u1',
        title: 'Morning Yoga',
        startTime: new Date().toISOString(),
        notificationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins from now
        deviceToken: 'fcm-token-1',
      },
      {
        id: 'w2',
        userId: 'u2',
        title: 'Evening Run',
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        notificationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
        deviceToken: 'fcm-token-2',
      },
    ];

    it('should fetch upcoming workouts successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockWorkouts, status: 200 });

      const result = await client.getUpcomingWorkouts(30);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/workouts/upcoming', {
        params: { lookAheadMinutes: 30 },
      });
      expect(result).toEqual(mockWorkouts);
    });

    it('should throw an error for invalid lookAheadMinutes', async () => {
      await expect(client.getUpcomingWorkouts(0)).rejects.toThrow('lookAheadMinutes must be a positive number.');
      await expect(client.getUpcomingWorkouts(-10)).rejects.toThrow(
        'lookAheadMinutes must be a positive number.',
      );
      await expect(client.getUpcomingWorkouts(NaN)).rejects.toThrow(
        'lookAheadMinutes must be a positive number.',
      );
    });

    it('should throw an error on API network failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(client.getUpcomingWorkouts(30)).rejects.toThrow(
        'Scheduling API network error: Network Error',
      );
    });

    it('should throw an error on non-2xx API response', async () => {
      const axiosError = new axios.AxiosError('Request failed with status code 500');
      axiosError.response = { status: 500, data: { message: 'Internal Server Error' } } as any;
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      await expect(client.getUpcomingWorkouts(30)).rejects.toThrow(
        'Scheduling API error: 500 - {"message":"Internal Server Error"}',
      );
    });

    it('should throw an error if API returns non-array data', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: {}, status: 200 });

      await expect(client.getUpcomingWorkouts(30)).rejects.toThrow(
        'Scheduling API returned an invalid data format (expected an array).',
      );
    });

    it('should warn and return data even if some workout data is malformed (missing fields)', async () => {
      const malformedWorkouts = [
        mockWorkouts[0],
        { id: 'w3', userId: 'u3', title: 'Bad Workout', startTime: 'invalid-date' } as ScheduledWorkout, // Missing notificationTime, deviceToken
        { ...mockWorkouts[1], deviceToken: undefined } as ScheduledWorkout, // Missing deviceToken
      ];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: malformedWorkouts, status: 200 });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await client.getUpcomingWorkouts(30);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SchedulingApiClient: Received malformed workout data:',
        expect.any(Object),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SchedulingApiClient: Received invalid date format in workout:',
        expect.any(Object),
      );
      expect(result).toEqual(malformedWorkouts);

      consoleWarnSpy.mockRestore();
    });
  });
});
