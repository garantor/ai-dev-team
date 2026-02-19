export const authenticateUser = (req, res, next) => {
  // In a real application, this would involve JWT verification.
  // For this task, we simulate authentication by expecting a 'Bearer <USER_ID>' token.
  // The USER_ID will be directly used as req.userId.

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required: No token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1]; // Expecting 'Bearer <USER_ID>'

  // Basic validation for the 'token' to be a number (simulating user ID)
  const userId = parseInt(token, 10);

  if (isNaN(userId) || userId <= 0) {
    return res.status(401).json({ message: 'Authentication required: Invalid user ID in token.' });
  }

  req.userId = userId;
  next();
};
