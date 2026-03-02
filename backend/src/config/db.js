import mongoose from 'mongoose';
import { MONGO_URI, NODE_ENV } from './env.js';

const connectDB = async (uri = MONGO_URI) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} (Environment: ${NODE_ENV})`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
