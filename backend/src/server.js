import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Ensure FIREBASE_SERVICE_ACCOUNT_KEY is correctly set in your .env file.');
});
