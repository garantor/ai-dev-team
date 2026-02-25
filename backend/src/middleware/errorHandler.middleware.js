export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';

  // Handle specific types of errors if needed
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: message
  });
};
