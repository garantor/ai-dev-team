/**
 * integration/types.ts
 * Defines the TypeScript interfaces for the Workout and Exercise API data models.
 */

/** Generic API Response structure */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

/** Workout Model */
export interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** Exercise Model */
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup: string; // e.g., 'Chest', 'Back', 'Legs'
  equipment?: string; // e.g., 'Barbell', 'Dumbbells', 'Machine', 'Bodyweight'
  createdAt: string;
  updatedAt: string;
}

/** Workout Log Model (a specific instance of a workout performed) */
export interface WorkoutLog {
  id: string;
  workoutId: string;
  startTime: string; // ISO 8601 string
  endTime?: string; // ISO 8601 string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Exercise Set Log Model (details for a single set within an exercise in a workout log) */
export interface ExerciseSetLog {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number; // in kg or lbs
  duration?: number; // in seconds
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a Workout */
export interface CreateWorkoutPayload {
  name: string;
  description?: string;
}

/** Payload for updating a Workout */
export interface UpdateWorkoutPayload {
  name?: string;
  description?: string;
}

/** Payload for creating an Exercise */
export interface CreateExercisePayload {
  name: string;
  description?: string;
  muscleGroup: string;
  equipment?: string;
}

/** Payload for updating an Exercise */
export interface UpdateExercisePayload {
  name?: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
}

/** Payload for creating a Workout Log */
export interface CreateWorkoutLogPayload {
  workoutId: string;
  startTime: string; // ISO 8601 string
  notes?: string;
}

/** Payload for updating a Workout Log */
export interface UpdateWorkoutLogPayload {
  startTime?: string; // ISO 8601 string
  endTime?: string; // ISO 8601 string
  notes?: string;
}

/** Payload for creating an Exercise Set Log */
export interface CreateExerciseSetLogPayload {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

/** Payload for updating an Exercise Set Log */
export interface UpdateExerciseSetLogPayload {
  setNumber?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
}
