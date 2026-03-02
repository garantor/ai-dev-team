import express from 'express';
import {
  createExercise,
  getExercisesByWorkoutId,
  getExerciseById,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js';
import validate from '../middleware/validationMiddleware.js';
import { exerciseSchema } from '../utils/validationSchemas.js';

const router = express.Router({ mergeParams: true }); // mergeParams to access workoutId from parent route

router.route('/').post(validate(exerciseSchema), createExercise).get(getExercisesByWorkoutId);
router
  .route('/:exerciseId')
  .get(getExerciseById)
  .put(validate(exerciseSchema), updateExercise)
  .delete(deleteExercise);

export default router;
