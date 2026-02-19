import express from 'express';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import workoutRoutes from './routes/workout.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(helmet()); // Add security headers
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // HTTP request logger

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workouts', workoutRoutes);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Workout Tracking API is running.', timestamp: new Date().toISOString() });
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handling middleware
app.use(errorHandler);

export default app;