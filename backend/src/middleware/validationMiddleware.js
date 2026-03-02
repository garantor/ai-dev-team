import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError.js';

const exerciseSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Exercise name cannot be empty',
    'any.required': 'Exercise name is required',
    'string.max': 'Exercise name cannot be more than 100 characters',
  }),
  sets: Joi.number().integer().min(1).required().messages({
    'number.base': 'Sets must be a number',
    'number.integer': 'Sets must be an integer',
    'number.min': 'Sets must be at least 1',
    'any.required': 'Sets is required',
  }),
  reps: Joi.number().integer().min(1).required().messages({
    'number.base': 'Reps must be a number',
    'number.integer': 'Reps must be an integer',
    'number.min': 'Reps must be at least 1',
    'any.required': 'Reps is required',
  }),
});

const scheduleSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Title cannot be empty',
    'any.required': 'Title is required',
    'string.max': 'Title cannot be more than 100 characters',
  }),
  description: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Description cannot be more than 500 characters',
  }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Date must be a valid date',
    'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
    'any.required': 'Date is required',
  }),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Start time must be in HH:MM format',
    'any.required': 'Start time is required',
  }),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'End time must be in HH:MM format',
    'any.required': 'End time is required',
  }),
  exercises: Joi.array().items(exerciseSchema).optional().messages({
    'array.base': 'Exercises must be an array',
  }),
}).custom((value, helpers) => {
  const startTime = parseInt(value.startTime?.replace(':', ''));
  const endTime = parseInt(value.endTime?.replace(':', ''));

  if (startTime && endTime && endTime <= startTime) {
    return helpers.error('any.custom', { message: 'End time must be after start time' });
  }
  return value;
}, 'Time comparison validation');

export const validateCreateSchedule = (req, res, next) => {
  const { error } = scheduleSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new AppError(error.message, StatusCodes.BAD_REQUEST));
  }
  next();
};

export const validateUpdateSchedule = (req, res, next) => {
  const { error } = scheduleSchema.min(1).validate(req.body, { abortEarly: false });
  if (error) {
    return next(new AppError(error.message, StatusCodes.BAD_REQUEST));
  }
  next();
};
