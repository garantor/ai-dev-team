import Joi from 'joi';

export const workoutSchema = Joi.object({
  type: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'Workout type must be a string.',
    'string.empty': 'Workout type cannot be empty.',
    'string.min': 'Workout type should have a minimum length of {#limit}.',
    'string.max': 'Workout type should have a maximum length of {#limit}.',
    'any.required': 'Workout type is required.',
  }),
  duration_minutes: Joi.number().integer().min(1).required().messages({
    'number.base': 'Duration must be a number.',
    'number.integer': 'Duration must be an integer.',
    'number.min': 'Duration must be at least {#limit} minute.',
    'any.required': 'Duration in minutes is required.',
  }),
  calories_burned: Joi.number().integer().min(0).allow(null).messages({
    'number.base': 'Calories burned must be a number.',
    'number.integer': 'Calories burned must be an integer.',
    'number.min': 'Calories burned cannot be negative.',
  }),
  notes: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': 'Notes must be a string.',
    'string.max': 'Notes should have a maximum length of {#limit}.',
  }),
  workout_date: Joi.date().iso().default(() => new Date()).messages({
    'date.base': 'Workout date must be a valid date.',
    'date.format': 'Workout date must be in ISO format (YYYY-MM-DD).',
  }),
});
