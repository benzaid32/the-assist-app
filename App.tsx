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
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { SubscriberOnboardingScreen } from './src/screens/auth/SubscriberOnboardingScreen';
import { ApplicantOnboardingScreen } from './src/screens/auth/ApplicantOnboardingScreen';
import { HomeScreen } from './src/screens/app/HomeScreen';
import { ProfileScreen } from './src/screens/app/ProfileScreen';
import { SettingsScreen } from './src/screens/app/SettingsScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { initializeFirebaseServices, FirebaseServices } from './src/services/firebase/config';
import { colors } from './src/constants/theme';
import { UserType } from './src/types/auth';

// Define types for tab navigation
type AppTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Define navigation types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SubscriberOnboarding: undefined; // Added for subscriber onboarding flow
  ApplicantOnboarding: undefined; // Added for applicant onboarding flow
  VerifyEmail: { userId: string; email: string; }; // Added for email verification flow
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Splash');
  const [isReady, setIsReady] = useState(false);

  // Determine the initial route based on authentication state
  useEffect(() => {
    if (!isLoading) {
      // If user is authenticated, go to app tabs
      if (isAuthenticated) {
        setInitialRoute('AppTabs');
      } else {
        // Check if we're in the middle of verification
        const isVerifying = user !== null && !isAuthenticated;
        
        // If we're in the middle of verification, stay on the onboarding screen
        if (isVerifying) {
          // Check user type to determine which onboarding screen to show
          if (user?.userType === UserType.SUBSCRIBER) {
            setInitialRoute('SubscriberOnboarding');
          } else if (user?.userType === UserType.APPLICANT) {
            setInitialRoute('ApplicantOnboarding');
          } else {
            setInitialRoute('Splash');
          }
        } else {
          setInitialRoute('Splash');
        }
      }
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading || !isReady) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRoute}
    >
      {!isAuthenticated ? (
        // Auth screens
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="SubscriberOnboarding" component={SubscriberOnboardingScreen} />
          <Stack.Screen name="ApplicantOnboarding" component={ApplicantOnboardingScreen} />
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
