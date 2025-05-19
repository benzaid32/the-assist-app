import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import types from navigation
import { AuthStackParamList, AppStackParamList, MainTabsParamList } from './src/navigation/AppNavigator';

// Export a combined type for all possible navigation routes
export type RootStackParamList = AuthStackParamList & AppStackParamList & MainTabsParamList;

// Import RootNavigator for proper navigation management
import { RootNavigator } from './src/navigation/AppNavigator';

// Import providers
import { AuthProvider } from './src/contexts/AuthContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { initializeFirebaseServices, FirebaseServices } from './src/services/firebase/config';
import { colors } from './src/constants/theme';

/**
 * Root application component
 * Sets up providers and root navigation
 */
export default function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    initializeFirebaseServices()
      .then((services) => {
        console.log('App: Firebase initialized successfully.');
        setFirebaseServices(services);
        setIsFirebaseReady(true);
      })
      .catch((error) => {
        console.error('App: Firebase initialization failed:', error);
        setFirebaseError(error.message || 'Failed to initialize Firebase. Please check logs.');
        setIsFirebaseReady(false);
      });
  }, []);

  if (firebaseError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Application Error</Text>
        <Text style={styles.errorDetails}>{firebaseError}</Text>
      </View>
    );
  }

  if (!isFirebaseReady || !firebaseServices) {
    return <LoadingScreen message="Initializing application..." />;
  }

  // Use only the RootNavigator from AppNavigator.tsx
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider auth={firebaseServices.auth} firestore={firebaseServices.firestore}>
          <RootNavigator />
          <StatusBar style="dark" />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FF3B30',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});
