import express from 'express';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON requests

// Routes
app.use('/api/v1/users', userRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
