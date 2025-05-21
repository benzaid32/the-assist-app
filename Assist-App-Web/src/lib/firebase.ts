import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Enterprise-grade Firebase configuration
 * With proper error handling, development mode detection, 
 * and fallback mechanisms
 */

// Check if any Firebase config values are missing
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

// Log missing variables in development mode
if (missingVars.length > 0) {
  console.error(`❌ Missing required Firebase environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file and add the missing variables.');
  console.error('Refer to the README.md file for setup instructions.');
  
  // In development, we can provide helpful info about the .env file
  if (import.meta.env.DEV) {
    console.info('💡 Development mode detected. Make sure your .env file is properly configured.');
    console.info('Create a .env file in the root of your project with the following variables:');
    console.info(`
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
`);
  }
}

// Get Firebase configuration from environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Safely store Firebase instances
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Initialize Firestore
  firestore = getFirestore(app);
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Connect to emulators in development mode if enabled
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    console.log('🔧 Connecting to Firebase emulators...');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('✅ Connected to Firebase emulators');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Create fallback instances for development to prevent app crashes
  if (import.meta.env.DEV) {
    console.warn('⚠️ Using fallback Firebase instances for development. Some features will not work.');
    // This is just to prevent TypeScript errors - these won't actually work
    app = {} as FirebaseApp;
    firestore = {} as Firestore;
    auth = {} as Auth;
  } else {
    // In production, we need to rethrow the error to prevent silent failures
    throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export Firebase services
export { app, firestore, auth };

// Helper function to check if Firebase is properly initialized
export function isFirebaseInitialized(): boolean {
  return firebaseConfig.apiKey !== undefined && 
         firebaseConfig.apiKey !== '' && 
         app !== undefined;
}
