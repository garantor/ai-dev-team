import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';

import scheduleRoutes from './routes/scheduleRoutes.js';
import AppError from './utils/AppError.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS for all routes
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 2) ROUTES
app.use('/api/schedules', scheduleRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND));
});

// 3) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

export default app;
