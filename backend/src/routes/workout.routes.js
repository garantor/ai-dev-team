import { Router } from 'express';
import { logWorkout, getWorkouts, updateWorkout, deleteWorkout } from '../controllers/workout.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validateWorkout, validateWorkoutUpdate } from '../middleware/validation.middleware.js';

const router = Router();

// All workout routes require authentication
router.use(authenticateUser);

// POST /api/v1/workouts - Log a new workout
router.post('/', validateWorkout, logWorkout);

// GET /api/v1/workouts - Retrieve all workouts for the authenticated user
router.get('/', getWorkouts);

// PUT /api/v1/workouts/:id - Update an existing workout
router.put('/:id', validateWorkoutUpdate, updateWorkout);

// DELETE /api/v1/workouts/:id - Delete a workout
router.delete('/:id', deleteWorkout);

export default router;
