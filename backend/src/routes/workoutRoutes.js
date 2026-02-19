import express from 'express';
import { createWorkout, getWorkouts, updateWorkout, deleteWorkout } from '../controllers/workoutController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// All workout routes require authentication
router.use(authenticateUser);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
