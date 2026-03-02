import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController.js';
import validate from '../middleware/validationMiddleware.js';
import { workoutSchema } from '../utils/validationSchemas.js';

const router = express.Router();

router.route('/').post(validate(workoutSchema), createWorkout).get(getWorkouts);
router
  .route('/:id')
  .get(getWorkoutById)
  .put(validate(workoutSchema), updateWorkout)
  .delete(deleteWorkout);

export default router;
