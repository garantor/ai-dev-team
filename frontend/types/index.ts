export interface Workout {
  id: string;
  type: string;
  duration: number; // in minutes
  caloriesBurned: number;
  notes?: string;
  date: string; // ISO 8601 string
}

export type RootStackParamList = {
  WorkoutHistory: undefined;
  WorkoutLog: undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutEdit: { workoutId: string };
};

export type WorkoutFormData = Omit<Workout, 'id' | 'date'>;
