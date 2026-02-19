import * as workoutModel from '../models/workout.model.js';

export const logWorkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workoutData = req.body;
    const newWorkout = await workoutModel.createWorkout(userId, workoutData);
    res.status(201).json(newWorkout);
  } catch (error) {
    next(error);
  }
};

export const getWorkouts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workouts = await workoutModel.getWorkoutsByUserId(userId);
    res.status(200).json(workouts);
  } catch (error) {
    next(error);
  }
};

export const updateWorkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const workoutData = req.body;

    const updatedWorkout = await workoutModel.updateWorkout(id, userId, workoutData);

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
    const userId = req.user.id;
    const { id } = req.params;

    const deletedWorkout = await workoutModel.deleteWorkout(id, userId);

    if (!deletedWorkout) {
      return res.status(404).json({ message: 'Workout not found or not authorized to delete.' });
    }

    res.status(200).json({ message: 'Workout deleted successfully.', id: deletedWorkout.id });
  } catch (error) {
    next(error);
  }
};
