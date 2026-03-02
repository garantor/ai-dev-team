import Workout from '../models/Workout.js';
import Exercise from '../models/Exercise.js';

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Public (for this task, no auth)
const createWorkout = async (req, res, next) => {
  try {
    const { name, description, userId } = req.body;

    const workout = new Workout({
      name,
      description,
      userId,
    });

    const createdWorkout = await workout.save();
    res.status(201).json(createdWorkout);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workouts
// @route   GET /api/workouts
// @access  Public
const getWorkouts = async (req, res, next) => {
  try {
    // Optionally filter by userId if provided in query or context
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const workouts = await Workout.find(filter);
    res.json(workouts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout by ID
// @route   GET /api/workouts/:id
// @access  Public
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (workout) {
      res.json(workout);
    } else {
      res.status(404);
      throw new Error('Workout not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Public
const updateWorkout = async (req, res, next) => {
  try {
    const { name, description, userId } = req.body;

    const workout = await Workout.findById(req.params.id);

    if (workout) {
      workout.name = name || workout.name;
      workout.description = description || workout.description;
      workout.userId = userId || workout.userId; // userId should ideally not be changed after creation

      const updatedWorkout = await workout.save();
      res.json(updatedWorkout);
    } else {
      res.status(404);
      throw new Error('Workout not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Public
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (workout) {
      // Also delete all associated exercises
      await Exercise.deleteMany({ workout: workout._id });
      await Workout.deleteOne({ _id: workout._id });
      res.json({ message: 'Workout and associated exercises removed' });
    } else {
      res.status(404);
      throw new Error('Workout not found');
    }
  } catch (error) {
    next(error);
  }
};

export { createWorkout, getWorkouts, getWorkoutById, updateWorkout, deleteWorkout };
