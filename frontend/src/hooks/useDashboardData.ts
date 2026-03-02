import { useState, useEffect, useCallback } from 'react';
import { Workout, ActivityItem, QuickAction } from '../types';

interface DashboardData {
  upcomingWorkouts: Workout[];
  recentActivity: ActivityItem[];
  quickActions: QuickAction[];
}

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'w1',
    name: 'Morning Cardio',
    date: '2024-03-10T07:00:00.000Z',
    time: '7:00 AM',
    location: 'Gym',
    type: 'cardio',
  },
  {
    id: 'w2',
    name: 'Strength Training - Legs',
    date: '2024-03-11T18:00:00.000Z',
    time: '6:00 PM',
    location: 'Home',
    type: 'strength',
  },
  {
    id: 'w3',
    name: 'Yoga Flow',
    date: '2024-03-12T09:00:00.000Z',
    time: '9:00 AM',
    location: 'Studio',
    type: 'yoga',
  },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    type: 'workout_completed',
    description: 'Completed "Full Body Workout"',
    timestamp: '2024-03-09T19:30:00.000Z',
    details: 'Duration: 60 min, Calories: 450',
  },
  {
    id: 'a2',
    type: 'goal_achieved',
    description: 'Achieved "Run 5K" goal',
    timestamp: '2024-03-08T10:15:00.000Z',
  },
  {
    id: 'a3',
    type: 'new_record',
    description: 'New personal record: 100kg Deadlift',
    timestamp: '2024-03-07T17:00:00.000Z',
  },
];

const MOCK_ACTIONS: QuickAction[] = [
  {
    id: 'qa1',
    label: 'Log Workout',
    icon: '🏋️',
    action: () => alert('Log Workout clicked!'),
  },
  {
    id: 'qa2',
    label: 'Add Goal',
    icon: '🎯',
    action: () => alert('Add Goal clicked!'),
  },
  {
    id: 'qa3',
    label: 'Track Meal',
    icon: '🍎',
    action: () => alert('Track Meal clicked!'),
  },
  {
    id: 'qa4',
    label: 'View Progress',
    icon: '📈',
    action: () => alert('View Progress clicked!'),
  },
];

/**
 * Custom hook to fetch and manage dashboard data.
 * Simulates an asynchronous API call.
 */
export const useDashboardData = (): UseDashboardDataResult => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate potential error
      if (Math.random() < 0.1) { // 10% chance of error
        throw new Error('Failed to fetch dashboard data. Please try again.');
      }

      setData({
        upcomingWorkouts: MOCK_WORKOUTS,
        recentActivity: MOCK_ACTIVITY,
        quickActions: MOCK_ACTIONS,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
