import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import workoutRoutes from './routes/workoutRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // Body parser middleware

app.get('/', (req, res) => {
  res.send('Workout Management API is running...');
});

// Workout routes
app.use('/api/workouts', workoutRoutes);

// Exercise routes (nested under workouts)
app.use('/api/workouts/:workoutId/exercises', exerciseRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
