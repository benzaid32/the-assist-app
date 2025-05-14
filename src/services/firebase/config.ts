// Switch to Firebase compat API instead of modular API
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (Object.values(firebaseConfig).some(value => !value)) {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key)
    .join(', ');
  console.error(`Firebase config error: Missing environment variables for: ${missingKeys}`);
}

if (__DEV__) {
  console.log('Firebase Config Loaded:', {
    apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    appId: firebaseConfig.appId ? '***' : 'MISSING',
  });
}

// Define a type for Firebase services using compat API
export interface FirebaseServices { 
  app: firebase.app.App;
  auth: firebase.auth.Auth;
  firestore: firebase.firestore.Firestore;
  storage: firebase.storage.Storage;
}

let firebaseServicesInstance: FirebaseServices | null = null;

export const initializeFirebaseServices = async (): Promise<FirebaseServices> => {
  if (firebaseServicesInstance) {
    return firebaseServicesInstance;
  }

  try {
    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Set persistence to local with AsyncStorage (React Native compatible)
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // Create services bundle
    const app = firebase.app();
    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const storage = firebase.storage();
    
    firebaseServicesInstance = {
      app,
      auth,
      firestore,
      storage
    };
    
    console.log('Firebase services initialized successfully.');
    return firebaseServicesInstance;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error(`Failed to initialize Firebase: ${error instanceof Error ? error.message : String(error)}`);
  }
};
