import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const MONGO_URI_TEST = process.env.MONGO_URI_TEST;
export const NODE_ENV = process.env.NODE_ENV || 'development';
