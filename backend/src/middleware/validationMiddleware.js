import Joi from 'joi';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const EQUIPMENT_TYPES = ['Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Kettlebell', 'Resistance Band', 'Cable', 'Other'];
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const exerciseSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Name should be a type of text',
    'string.empty': 'Name cannot be an empty field',
    'string.min': 'Name should have a minimum length of {#limit}',
    'string.max': 'Name should have a maximum length of {#limit}',
    'any.required': 'Name is a required field',
  }),
  description: Joi.string().min(10).max(500).required().messages({
    'string.base': 'Description should be a type of text',
    'string.empty': 'Description cannot be an empty field',
    'string.min': 'Description should have a minimum length of {#limit}',
    'string.max': 'Description should have a maximum length of {#limit}',
    'any.required': 'Description is a required field',
  }),
  muscleGroup: Joi.array().items(Joi.string().valid(...MUSCLE_GROUPS)).min(1).required().messages({
    'array.base': 'Muscle group should be an array',
    'array.min': 'At least one muscle group must be selected',
    'any.required': 'Muscle group is a required field',
    'any.only': `Muscle group contains an invalid value. Allowed values: ${MUSCLE_GROUPS.join(', ')}`,
  }),
  equipment: Joi.array().items(Joi.string().valid(...EQUIPMENT_TYPES)).min(1).required().messages({
    'array.base': 'Equipment should be an array',
    'array.min': 'At least one equipment type must be selected',
    'any.required': 'Equipment is a required field',
    'any.only': `Equipment contains an invalid value. Allowed values: ${EQUIPMENT_TYPES.join(', ')}`,
  }),
  difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).required().messages({
    'string.base': 'Difficulty should be a type of text',
    'string.empty': 'Difficulty cannot be an empty field',
    'any.required': 'Difficulty is a required field',
    'any.only': `Difficulty must be one of ${DIFFICULTY_LEVELS.join(', ')}`,
  }),
  isCompound: Joi.boolean().optional().messages({
    'boolean.base': 'isCompound should be a boolean',
  }),
});

export const exerciseUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    'string.base': 'Name should be a type of text',
    'string.empty': 'Name cannot be an empty field',
    'string.min': 'Name should have a minimum length of {#limit}',
    'string.max': 'Name should have a maximum length of {#limit}',
  }),
  description: Joi.string().min(10).max(500).messages({
    'string.base': 'Description should be a type of text',
    'string.empty': 'Description cannot be an empty field',
    'string.min': 'Description should have a minimum length of {#limit}',
    'string.max': 'Description should have a maximum length of {#limit}',
  }),
  muscleGroup: Joi.array().items(Joi.string().valid(...MUSCLE_GROUPS)).min(1).messages({
    'array.base': 'Muscle group should be an array',
    'array.min': 'At least one muscle group must be selected',
    'any.only': `Muscle group contains an invalid value. Allowed values: ${MUSCLE_GROUPS.join(', ')}`,
  }),
  equipment: Joi.array().items(Joi.string().valid(...EQUIPMENT_TYPES)).min(1).messages({
    'array.base': 'Equipment should be an array',
    'array.min': 'At least one equipment type must be selected',
    'any.only': `Equipment contains an invalid value. Allowed values: ${EQUIPMENT_TYPES.join(', ')}`,
  }),
  difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).messages({
    'string.base': 'Difficulty should be a type of text',
    'string.empty': 'Difficulty cannot be an empty field',
    'any.only': `Difficulty must be one of ${DIFFICULTY_LEVELS.join(', ')}`,
  }),
  isCompound: Joi.boolean().messages({
    'boolean.base': 'isCompound should be a boolean',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};
