// Import Firebase core app initializer
import { initializeApp } from 'firebase/app';

// Import Firebase Authentication service
import { getAuth } from 'firebase/auth';

/**
 * Firebase Configuration
 *
 * Purpose:
 * - Loads Firebase credentials from environment variables.
 * - Keeps sensitive information out of source code.
 *
 * Notes:
 * - Uses Vite's `import.meta.env` to access environment variables.
 * - These values must be defined in a `.env` file (e.g., .env.local).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase application using the configuration above
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

// Export the Firebase app (optional, but useful for other Firebase services)
export default app;
