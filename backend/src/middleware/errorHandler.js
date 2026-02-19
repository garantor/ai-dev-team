/**
 * Global error handling middleware for Express.
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({
    message: message,
    // In production, you might not want to send the full error stack to the client
    // stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export default errorHandler;
