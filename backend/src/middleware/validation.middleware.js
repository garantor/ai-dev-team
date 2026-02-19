import Joi from 'joi';

const workoutSchema = Joi.object({
  type: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'Workout type must be a string.',
    'string.empty': 'Workout type cannot be empty.',
    'string.min': 'Workout type must be at least {#limit} characters long.',
    'string.max': 'Workout type cannot exceed {#limit} characters.',
    'any.required': 'Workout type is required.'
  }),
  duration_minutes: Joi.number().integer().min(1).required().messages({
    'number.base': 'Duration must be a number.',
    'number.integer': 'Duration must be an integer.',
    'number.min': 'Duration must be at least {#limit} minutes.',
    'any.required': 'Duration in minutes is required.'
  }),
  calories_burned: Joi.number().integer().min(0).allow(null).messages({
    'number.base': 'Calories burned must be a number.',
    'number.integer': 'Calories burned must be an integer.',
    'number.min': 'Calories burned cannot be negative.'
  }),
  notes: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': 'Notes must be a string.',
    'string.max': 'Notes cannot exceed {#limit} characters.'
  }),
  workout_date: Joi.date().iso().default(new Date()).messages({
    'date.base': 'Workout date must be a valid date.',
    'date.format': 'Workout date must be in ISO format (YYYY-MM-DD).' // Joi.date().iso() implies this
  })
});

export const validateWorkout = (req, res, next) => {
  const { error } = workoutSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  next();
};

export const validateWorkoutUpdate = (req, res, next) => {
  // For update, all fields are optional, but if present, they must be valid.
  const updateSchema = workoutSchema.optional();
  const { error } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  // Ensure at least one field is provided for update
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'At least one field must be provided for update.' });
  }
  next();
};
