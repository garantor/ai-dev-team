import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Workout, ActivityItem, QuickAction } from '../../types';

// Mock the custom hook
vi.mock('../../hooks/useDashboardData');

const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Test Workout 1',
    date: '2024-03-10T07:00:00.000Z',
    time: '7:00 AM',
    location: 'Gym',
    type: 'strength',
  },
];

const mockActivity: ActivityItem[] = [
  {
    id: 'a1',
    type: 'workout_completed',
    description: 'Completed "Test Workout"',
    timestamp: '2024-03-09T19:30:00.000Z',
  },
];

const mockActions: QuickAction[] = [
  {
    id: 'qa1',
    label: 'Test Action',
    icon: '✨',
    action: vi.fn(),
  },
];

const mockData = {
  upcomingWorkouts: mockWorkouts,
  recentActivity: mockActivity,
  quickActions: mockActions,
};

describe('Dashboard', () => {
  it('renders loading state initially', () => {
    (useDashboardData as vi.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText(/Loading dashboard data.../i)).toBeInTheDocument();
  });

  it('renders dashboard content after data loads successfully', async () => {
    (useDashboardData as vi.Mock).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Test Action')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Workouts')).toBeInTheDocument();
      expect(screen.getByText('Test Workout 1')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText(/Completed "Test Workout"/i)).toBeInTheDocument();
    });
  });

  it('renders error state if data fetching fails', async () => {
    const mockRefetch = vi.fn();
    (useDashboardData as vi.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to fetch data',
      refetch: mockRefetch,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch data/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  it('renders empty state if no data is available after loading', async () => {
    const mockRefetch = vi.fn();
    (useDashboardData as vi.Mock).mockReturnValue({
      data: {
        upcomingWorkouts: [],
        recentActivity: [],
        quickActions: [],
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText(/No quick actions available./i)).toBeInTheDocument();
      expect(screen.getByText('Upcoming Workouts')).toBeInTheDocument();
      expect(screen.getByText(/No upcoming workouts scheduled./i)).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText(/No recent activity to display./i)).toBeInTheDocument();
    });
  });
});
