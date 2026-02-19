export interface Workout { 
  id: string;
  type: string;
  duration: number; // in minutes
  caloriesBurned: number;
  notes?: string;
  date: string; // ISO string, e.g., '2023-10-27T10:00:00Z'
}

export interface WorkoutFormData {
  type: string;
  duration: string; // string for input field to handle empty/non-numeric
  caloriesBurned: string; // string for input field
  notes: string;
}

export type RootStackParamList = {
  WorkoutList: undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutLog: { workoutId?: string } | undefined;
};
