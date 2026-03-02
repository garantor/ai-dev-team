export interface Workout {
  id: string;
  name: string;
  date: string; // ISO date string or similar
  time: string;
  location: string;
  type: 'strength' | 'cardio' | 'yoga' | 'flexibility' | 'other';
}

export interface ActivityItem {
  id: string;
  type: 'workout_completed' | 'goal_achieved' | 'new_record' | 'measurement_updated';
  description: string;
  timestamp: string; // ISO date string
  details?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string; // e.g., 'add-workout', 'log-meal'
  action: () => void;
}
