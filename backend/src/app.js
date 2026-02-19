import express from 'express';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';

import workoutRoutes from './routes/workoutRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';


const app = express();

// Middleware

app.use(express.json()); // Body parser for JSON requests

// Routes
app.use('/api/v1/users', userRoutes);

// Global Error Handler

// Routes
app.use('/api/v1/workouts', workoutRoutes);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Workout Tracking API is running.' });
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

export default app;
