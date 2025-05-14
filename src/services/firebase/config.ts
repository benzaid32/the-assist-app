/**
 * Firebase Configuration Module
 * 
 * Enterprise-grade implementation with enhanced error handling, verification,
 * and logging following production best practices.
 */

// Using Firebase compat API for broader compatibility
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; // Import for side effects to populate firebase.auth and for types
import 'firebase/compat/firestore'; // Import for side effects and types
import 'firebase/compat/storage'; // Import for side effects and types
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Load environment variables with fallbacks
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || Constants.expoConfig?.extra?.firebaseDatabaseURL,
};

// Verify configuration integrity
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingRequiredKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingRequiredKeys.length > 0) {
  console.error(`CRITICAL: Firebase initialization will fail. Missing required config: ${missingRequiredKeys.join(', ')}`);
}

// Log configuration status for debugging in development
if (__DEV__) {
  console.log('Firebase Config Status:', {
    apiKey: firebaseConfig.apiKey ? 'PROVIDED ✓' : 'MISSING ❌',
    authDomain: firebaseConfig.authDomain ? 'PROVIDED ✓' : 'MISSING ❌',
    projectId: firebaseConfig.projectId ? 'PROVIDED ✓' : 'MISSING ❌',
    storageBucket: firebaseConfig.storageBucket ? 'PROVIDED ✓' : 'MISSING ❌',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'PROVIDED ✓' : 'MISSING ❌',
    appId: firebaseConfig.appId ? 'PROVIDED ✓' : 'MISSING ❌',
    databaseURL: firebaseConfig.databaseURL ? 'PROVIDED ✓' : 'N/A',
  });
}

/**
 * Firebase Service Types and Initialization
 */

// Define interface for Firebase services using compat API
export interface FirebaseServices {
  app: firebase.app.App; // Correctly typed for compat SDK
  auth: firebase.auth.Auth;
  firestore: firebase.firestore.Firestore;
  storage: firebase.storage.Storage;
}

let firebaseServicesInstance: FirebaseServices | null = null;

/**
 * Initializes Firebase services with robust error handling
 * and connection verification
 * 
 * @returns Promise resolving to Firebase services interface
 * @throws Error if initialization fails
 */
export const initializeFirebaseServices = async (): Promise<FirebaseServices> => {
  // Return existing instance if available (Singleton pattern)
  if (firebaseServicesInstance) {
    return firebaseServicesInstance;
  }

  console.log('Initializing Firebase services...');
  try {
    // Verify that required config values exist
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
    
    if (missingKeys.length > 0) {
      throw new Error(`Cannot initialize Firebase: Missing required configuration: ${missingKeys.join(', ')}`);
    }

    // Initialize Firebase - only if no app exists yet
    let app: firebase.app.App;
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig); // Use compat initializeApp
    } else {
      app = firebase.app(); // Get existing default app
      console.log('Using existing Firebase app instance');
    }

    const auth = firebase.auth(app); // Get auth from the app instance
    const firestore = firebase.firestore(app);
    const storage = firebase.storage(app);

    // Set appropriate Firebase Auth persistence for React Native environment
    try {
      // For React Native, we'll explicitly set persistence to NONE to avoid AsyncStorage issues
      // This means users will need to log in each time the app is closed completely
      // For a production app, you might want to implement a custom token refresh mechanism
      await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
      console.log('Firebase auth persistence explicitly set to NONE for React Native compatibility.');
      
      // Note: If you want to enable persistence in the future, you would need to:
      // 1. Implement a custom persistence layer using AsyncStorage
      // 2. Use the Firebase Admin SDK to generate custom tokens
      // 3. Handle token refresh manually
    } catch (persistenceError) {
      console.warn('Failed to set Firebase auth persistence:', persistenceError);
      // Non-fatal error - the app will continue with default persistence
      // which may or may not work correctly in React Native
    }
    
    // Verify auth service is properly initialized (firebase.auth(app) should throw if app is invalid)
    // This specific check on 'auth' might be redundant if firebase.auth(app) guarantees an instance or throws.
    // However, keeping it for explicitness until behavior is fully confirmed across scenarios.
    if (!auth) { 
      throw new Error('Firebase auth service failed to initialize');
    }
    
    firebaseServicesInstance = {
      app,
      auth,
      firestore,
      storage
    };
    
    console.log('✅ Firebase services initialized successfully');
    return firebaseServicesInstance;
  } catch (error) {
    console.error('⛔ Firebase initialization error:', error);
    throw new Error(`Failed to initialize Firebase: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Retrieves the initialized Firebase services bundle.
 * Throws an error if services are not initialized.
 */
export const getFirebaseServices = (): FirebaseServices => {
  if (!firebaseServicesInstance) {
    throw new Error('Firebase services not initialized. Call initializeFirebaseServices() at app startup.');
  }
  return firebaseServicesInstance;
};

/**
 * Gets the current authenticated user from Firebase.
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = (): firebase.User | null => {
  // After successful initialization, firebase.auth().currentUser should be reliable.
  if (firebase.apps.length > 0 && typeof firebase.auth === 'function') {
    return firebase.auth().currentUser;
  }
  // Fallback or if called before full init, though ideally initializeFirebaseServices is awaited.
  return firebaseServicesInstance?.auth.currentUser || null;
};
