import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';

// @desc    Add an exercise to a workout
// @route   POST /api/workouts/:workoutId/exercises
// @access  Public
const createExercise = async (req, res, next) => {
  try {
    const { workoutId } = req.params;
    const { name, sets, reps, weight, unit, notes, order } = req.body;

    const workoutExists = await Workout.findById(workoutId);
    if (!workoutExists) {
      res.status(404);
      throw new Error('Workout not found');
    }

    const exercise = new Exercise({
      workout: workoutId,
      name,
      sets,
      reps,
      weight,
      unit,
      notes,
      order,
    });

    const createdExercise = await exercise.save();
    res.status(201).json(createdExercise);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exercises for a specific workout
// @route   GET /api/workouts/:workoutId/exercises
// @access  Public
const getExercisesByWorkoutId = async (req, res, next) => {
  try {
    const { workoutId } = req.params;

    const workoutExists = await Workout.findById(workoutId);
    if (!workoutExists) {
      res.status(404);
      throw new Error('Workout not found');
    }

    const exercises = await Exercise.find({ workout: workoutId }).sort('order');
    res.json(exercises);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single exercise by ID within a workout
// @route   GET /api/workouts/:workoutId/exercises/:exerciseId
// @access  Public
const getExerciseById = async (req, res, next) => {
  try {
    const { workoutId, exerciseId } = req.params;

    const exercise = await Exercise.findOne({ _id: exerciseId, workout: workoutId });

    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404);
      throw new Error('Exercise not found in this workout');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update an exercise by ID within a workout
// @route   PUT /api/workouts/:workoutId/exercises/:exerciseId
// @access  Public
const updateExercise = async (req, res, next) => {
  try {
    const { workoutId, exerciseId } = req.params;
    const { name, sets, reps, weight, unit, notes, order } = req.body;

    const exercise = await Exercise.findOne({ _id: exerciseId, workout: workoutId });

    if (exercise) {
      exercise.name = name ?? exercise.name;
      exercise.sets = sets ?? exercise.sets;
      exercise.reps = reps ?? exercise.reps;
      exercise.weight = weight ?? exercise.weight;
      exercise.unit = unit ?? exercise.unit;
      exercise.notes = notes ?? exercise.notes;
      exercise.order = order ?? exercise.order;

      const updatedExercise = await exercise.save();
      res.json(updatedExercise);
    } else {
      res.status(404);
      throw new Error('Exercise not found in this workout');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an exercise by ID within a workout
// @route   DELETE /api/workouts/:workoutId/exercises/:exerciseId
// @access  Public
const deleteExercise = async (req, res, next) => {
  try {
    const { workoutId, exerciseId } = req.params;

    const exercise = await Exercise.findOne({ _id: exerciseId, workout: workoutId });

    if (exercise) {
      await Exercise.deleteOne({ _id: exercise._id });
      res.json({ message: 'Exercise removed' });
    } else {
      res.status(404);
      throw new Error('Exercise not found in this workout');
    }
  } catch (error) {
    next(error);
  }
};

export { createExercise, getExercisesByWorkoutId, getExerciseById, updateExercise, deleteExercise };
