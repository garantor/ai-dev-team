import admin from 'firebase-admin';

// Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in .env
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined in environment variables.');
  process.exit(1);
}

let serviceAccount;
try {
  // Attempt to parse the JSON string directly
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (error) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string.', error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firebaseAuth = admin.auth();

export default firebaseAuth;
