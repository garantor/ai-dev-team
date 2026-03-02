import Exercise from '../models/exerciseModel.js';

// @desc    Create a new exercise
// @route   POST /api/exercises
// @access  Public (for now, could be Private/Admin later)
export const createExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
export const getAllExercises = async (req, res, next) => {
  try {
    // Basic filtering, sorting, pagination could be added here
    const exercises = await Exercise.find({});
    res.status(200).json(exercises);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single exercise by ID
// @route   GET /api/exercises/:id
// @access  Public
export const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json(exercise);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an exercise by ID
// @route   PUT /api/exercises/:id
// @access  Public
export const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators on update
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json(exercise);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an exercise by ID
// @route   DELETE /api/exercises/:id
// @access  Public
export const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json({ message: 'Exercise removed successfully' });
  } catch (error) {
    next(error);
  }
};
