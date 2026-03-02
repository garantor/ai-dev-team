import express from 'express';
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import {
  validateCreateSchedule,
  validateUpdateSchedule,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(validateCreateSchedule, createSchedule)
  .get(getAllSchedules);

router
  .route('/:id')
  .get(getScheduleById)
  .put(validateUpdateSchedule, updateSchedule)
  .delete(deleteSchedule);

export default router;
