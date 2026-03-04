export enum WorkoutType {
  Strength = "Strength",
  Cardio = "Cardio",
  Flexibility = "Flexibility",
  Sports = "Sports",
}

export enum ExerciseCategory {
  Strength = "Strength",
  Cardio = "Cardio",
  Flexibility = "Flexibility",
  Sports = "Sports",
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  description: string;
  caloriesPerMinute: number;
  imageEmoji: string;
}

export interface Workout {
  id: string;
  exerciseId?: string;
  exerciseName: string;
  type: WorkoutType;
  duration: number;
  caloriesBurned: number;
  date: string;
  notes?: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalDuration: number;
  workoutCount: number;
  steps: number;
}

export interface UserSettings {
  userName: string;
  dailyStepGoal: number;
  dailyCalorieGoal: number;
  weeklyWorkoutGoal: number;
}
