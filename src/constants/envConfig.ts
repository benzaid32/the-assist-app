/**
 * Environment variables with type safety
 * In a production app, these values should be pulled from .env via Expo's environment variables
 * For development purposes, we're defining them here for easier setup
 */
export const ENV_CONFIG = {
  // Firebase Config
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "sender-id",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "app-id",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "measurement-id"
  }
};
