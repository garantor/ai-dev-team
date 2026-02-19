import * as workoutModel from '../models/workoutModel.js';
import { workoutSchema } from '../utils/validation.js';

export const createWorkout = async (req, res, next) => {
  try {
    const { error, value } = workoutSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      throw error;
    }

    const newWorkout = await workoutModel.createWorkout({ ...value, userId: req.userId });
    res.status(201).json(newWorkout);
  } catch (error) {
    next(error);
  }
};

export const getWorkouts = async (req, res, next) => {
  try {
    const workouts = await workoutModel.getWorkoutsByUserId(req.userId);
    res.status(200).json(workouts);
  } catch (error) {
    next(error);
  }
};

export const updateWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = workoutSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      throw error;
    }

    const updatedWorkout = await workoutModel.updateWorkout(id, req.userId, value);

    if (!updatedWorkout) {
      return res.status(404).json({ message: 'Workout not found or not authorized to update.' });
    }

    res.status(200).json(updatedWorkout);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedWorkout = await workoutModel.deleteWorkout(id, req.userId);

    if (!deletedWorkout) {
      return res.status(404).json({ message: 'Workout not found or not authorized to delete.' });
    }

    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    next(error);
  }
};
