import Joi from 'joi';

/**
 * Joi schema for user registration.
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'string.empty': 'Email is required.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 100 characters.',
    'string.empty': 'Name is required.',
    'any.required': 'Name is required.'
  }),
  university: Joi.string().allow('').max(100).optional().messages({
    'string.max': 'University name cannot exceed 100 characters.'
  })
});

/**
 * Joi schema for user login.
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'string.empty': 'Email is required.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.'
  })
});

/**
 * Middleware factory for Joi validation.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @returns {function(object, object, function): void} Express middleware function.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
};

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
