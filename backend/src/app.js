import express from 'express';
import authRoutes from '../routes/authRoutes.js';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/auth', authRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

export default app;
