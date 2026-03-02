import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import exerciseRoutes from './routes/exerciseRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Logging Middleware
app.use(morgan('dev'));

// Body Parser Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Exercise Library API is running...</h1><p>Access API at /api/exercises</p>');
});

// API Routes
app.use('/api/exercises', exerciseRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
