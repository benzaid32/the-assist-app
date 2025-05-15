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

// Import RootNavigator for proper navigation management
import { RootNavigator } from './src/navigation/AppNavigator';

// Direct imports of screens
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { SubscriberOnboardingScreen } from './src/screens/auth/SubscriberOnboardingScreen';
import { ApplicantOnboardingScreen } from './src/screens/auth/ApplicantOnboardingScreen';
import { HomeScreen } from './src/screens/app/HomeScreen';
import SettingsScreen from './src/screens/app/settings/SettingsScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { initializeFirebaseServices, FirebaseServices } from './src/services/firebase/config';
import { colors } from './src/constants/theme';
import { UserType } from './src/types/auth';

// Define types for tab navigation
type AppTabParamList = {
  Home: undefined;
  Settings: undefined;
};

// Define navigation types following enterprise-grade TypeScript standards
// The explicit type definition ensures type safety across the application
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SubscriberOnboarding: undefined; // Subscriber onboarding flow
  ApplicantOnboarding: undefined; // Applicant onboarding flow
  VerifyEmail: { userId: string; email: string; }; // Email verification flow
  AppTabs: undefined; // Bottom tab navigator
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
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Main navigation component that will be wrapped with auth context
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Welcome');
  const [isReady, setIsReady] = useState(false);

  // Determine the initial route based on authentication state with proper enterprise-grade type safety
  useEffect(() => {
    if (!isLoading) {
      // Debug logs for authentication state
      console.log('Authentication state:', { 
        isAuthenticated, 
        userExists: !!user,
        userId: user?.userId || 'none',
        userType: user?.userType || 'none'
      });

      // If user is authenticated, go to app tabs
      if (isAuthenticated && user) {
        setInitialRoute('AppTabs');
        console.log('Navigation: Setting initial route to AppTabs after authentication');
      } else {
        // Check if we're in the middle of verification
        const isVerifying = user !== null && !isAuthenticated;
        
        // If we're in the middle of verification, stay on the onboarding screen
        if (isVerifying) {
          // Check user type to determine which onboarding screen to show
          if (user?.userType === UserType.SUBSCRIBER) {
            setInitialRoute('SubscriberOnboarding');
            console.log('Navigation: Setting initial route to SubscriberOnboarding');
          } else if (user?.userType === UserType.APPLICANT) {
            setInitialRoute('ApplicantOnboarding');
            console.log('Navigation: Setting initial route to ApplicantOnboarding');
          } else {
            setInitialRoute('Welcome');
            console.log('Navigation: Setting initial route to Welcome (unknown user type)');
          }
        } else {
          setInitialRoute('Welcome');
          console.log('Navigation: Setting initial route to Welcome (not authenticated)');
        }
      }
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading || !isReady) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Using flat navigation structure as recommended for React Navigation v7
  // This avoids "component has not been registered" errors
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRoute}
    >
      {/* Register ALL screens upfront regardless of auth state */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SubscriberOnboarding" component={SubscriberOnboardingScreen} />
      <Stack.Screen name="ApplicantOnboarding" component={ApplicantOnboardingScreen} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
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

  // Updated root component with proper enterprise-grade navigation architecture
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider auth={firebaseServices.auth} firestore={firebaseServices.firestore}>
          {/* Using RootNavigator from AppNavigator.tsx to handle navigation state */}
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
