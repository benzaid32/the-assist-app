import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Ensure react-native-screens is enabled for native-stack support
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

enableScreens();

// Direct imports of screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { initializeFirebaseServices, FirebaseServices } from './src/services/firebase/config';

// Simple dashboard placeholder
const DashboardScreen = () => (
  <View style={styles.container}>
    <Text style={styles.welcomeText}>Welcome to The Assist App</Text>
    <Text style={styles.infoText}>Authentication successful!</Text>
  </View>
);

// Define navigation types
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
};

// Create stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Main navigation component that will be wrapped with auth context
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
    >
      {!isAuthenticated ? (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        // App screens
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      )}
    </Stack.Navigator>
  );
};
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

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider auth={firebaseServices.auth} firestore={firebaseServices.firestore}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 8,
    textAlign: 'center',
  },
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
