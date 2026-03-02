import app from './app.js';
import connectDB from './config/db.js';
import { PORT, MONGO_URI, NODE_ENV } from './config/env.js';

// Connect to database
connectDB(MONGO_URI);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});
