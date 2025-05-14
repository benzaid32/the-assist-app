import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Ensure react-native-screens is enabled for native-stack support
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

enableScreens();

// Direct imports of screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/app/HomeScreen';
import { ProfileScreen } from './src/screens/app/ProfileScreen';
import { SettingsScreen } from './src/screens/app/SettingsScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { initializeFirebaseServices, FirebaseServices } from './src/services/firebase/config';
import { colors } from './src/constants/theme';

// Define types for tab navigation
type AppTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Define navigation types
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  AppTabs: undefined; // This will hold our bottom tab navigator
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// Bottom tab navigator component
const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'alert-circle-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { borderTopColor: colors.neutralBorders },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

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
      initialRouteName={isAuthenticated ? 'AppTabs' : 'Login'}
    >
      {!isAuthenticated ? (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        // App screens with bottom tabs
        <Stack.Screen name="AppTabs" component={AppTabs} />
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
