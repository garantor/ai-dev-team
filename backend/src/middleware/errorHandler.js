
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message, details: err.details });
  }

  // Generic error response
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected error occurred.',
  });
};

