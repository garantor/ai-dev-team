import { StatusCodes } from 'http-status-codes';
import Schedule from '../models/Schedule.js';
import AppError from '../utils/AppError.js';

// @desc    Create a new workout schedule
// @route   POST /api/schedules
// @access  Public
export const createSchedule = async (req, res, next) => {
  try {
    const newSchedule = await Schedule.create(req.body);
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: newSchedule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workout schedules
// @route   GET /api/schedules
// @access  Public
export const getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find({});
    res.status(StatusCodes.OK).json({
      status: 'success',
      results: schedules.length,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single workout schedule by ID
// @route   GET /api/schedules/:id
// @access  Public
export const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return next(new AppError('No schedule found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a workout schedule by ID
// @route   PUT /api/schedules/:id
// @access  Public
export const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!schedule) {
      return next(new AppError('No schedule found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a workout schedule by ID
// @route   DELETE /api/schedules/:id
// @access  Public
export const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return next(new AppError('No schedule found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
