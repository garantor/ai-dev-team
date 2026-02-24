import { v4 as uuidv4 } from 'uuid';

export const generateUniqueEmail = () => `testuser_${uuidv4()}@example.com`;
export const generateUniqueUsername = () => `testuser_${uuidv4().substring(0, 8)}`;
export const generatePassword = () => `Password123!${uuidv4().substring(0, 4)}`;
export const generateWorkoutName = () => `Test Workout ${uuidv4().substring(0, 6)}`;
export const generateGoalName = () => `Fitness Goal ${uuidv4().substring(0, 6)}`;

export const getTestUser = () => ({
  email: generateUniqueEmail(),
  username: generateUniqueUsername(),
  password: generatePassword(),
});

export const getTestProfile = () => ({
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  heightCm: 180,
  weightKg: 75,
  gender: 'Male',
});

export const getTestWorkout = (type = 'Strength') => ({
  type,
  name: generateWorkoutName(),
  durationMinutes: 60,
  caloriesBurned: 500,
  date: new Date().toISOString().split('T')[0],
  notes: 'Leg day with squats and deadlifts',
  exercises: [
    { name: 'Squats', sets: 3, reps: 10, weightKg: 80 },
    { name: 'Deadlifts', sets: 3, reps: 5, weightKg: 100 },
  ],
});

export const getTestGoal = (type = 'Weight Loss') => ({
  type,
  name: generateGoalName(),
  targetValue: 70,
  currentValue: 75,
  unit: 'kg',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  status: 'In Progress',
});