import express from 'express';
import {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js';
import { validate, exerciseSchema, exerciseUpdateSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(validate(exerciseSchema), createExercise)
  .get(getAllExercises);

router.route('/:id')
  .get(getExerciseById)
  .put(validate(exerciseUpdateSchema), updateExercise)
  .delete(deleteExercise);

export default router;
