import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in your .env file
// It should be the stringified JSON content of your Firebase service account key file.
// Example: FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (error) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is valid JSON string.', error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();

export { auth };
