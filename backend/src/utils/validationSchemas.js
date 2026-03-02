import Joi from 'joi';

export const workoutSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    'string.base': 'Workout name must be a string',
    'string.empty': 'Workout name cannot be empty',
    'string.min': 'Workout name should have a minimum length of {#limit}',
    'string.max': 'Workout name should have a maximum length of {#limit}',
    'any.required': 'Workout name is required',
  }),
  description: Joi.string().trim().max(500).allow('').messages({
    'string.base': 'Description must be a string',
    'string.max': 'Description should have a maximum length of {#limit}',
  }),
  userId: Joi.string().trim().required().messages({
    'string.base': 'User ID must be a string',
    'string.empty': 'User ID cannot be empty',
    'any.required': 'User ID is required',
  }),
});

export const exerciseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'Exercise name must be a string',
    'string.empty': 'Exercise name cannot be empty',
    'string.min': 'Exercise name should have a minimum length of {#limit}',
    'string.max': 'Exercise name should have a maximum length of {#limit}',
    'any.required': 'Exercise name is required',
  }),
  sets: Joi.number().integer().min(1).required().messages({
    'number.base': 'Sets must be a number',
    'number.integer': 'Sets must be an integer',
    'number.min': 'Sets must be at least {#limit}',
    'any.required': 'Sets is required',
  }),
  reps: Joi.number().integer().min(1).required().messages({
    'number.base': 'Reps must be a number',
    'number.integer': 'Reps must be an integer',
    'number.min': 'Reps must be at least {#limit}',
    'any.required': 'Reps is required',
  }),
  weight: Joi.number().min(0).default(0).messages({
    'number.base': 'Weight must be a number',
    'number.min': 'Weight must be at least {#limit}',
  }),
  unit: Joi.string().valid('kg', 'lbs', 'bodyweight').default('kg').messages({
    'string.base': 'Unit must be a string',
    'any.only': 'Unit must be one of [kg, lbs, bodyweight]',
  }),
  notes: Joi.string().trim().max(500).allow('').messages({
    'string.base': 'Notes must be a string',
    'string.max': 'Notes should have a maximum length of {#limit}',
  }),
  order: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Order must be a number',
    'number.integer': 'Order must be an integer',
    'number.min': 'Order must be at least {#limit}',
  }),
});
