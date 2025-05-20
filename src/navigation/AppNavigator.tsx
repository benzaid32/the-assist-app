import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { SubscriberOnboardingScreen } from '../screens/auth/SubscriberOnboardingScreen';
import { ApplicantOnboardingScreen } from '../screens/auth/ApplicantOnboardingScreen';

// App Screens
import { HomeScreen } from '../screens/app/HomeScreen';
import SettingsScreen from '../screens/app/settings/SettingsScreen';
import { DocumentUploadScreen } from '../screens/app/DocumentUploadScreen';
import SupportInfoScreen from '../screens/app/settings/SupportInfoScreen';
import DonorCircleScreen from '../screens/app/DonorCircleScreen';
import SupportNetworkScreen from '../screens/app/SupportNetworkScreen';

// Premium Features
import { ImpactDashboard, ResourceLibrary } from '../features/premium';

// Community Features
import DonorFeed from '../features/community/components/DonorFeed';
import ResourceHub from '../features/community/components/ResourceHub';
import CommunityQA from '../features/community/components/CommunityQA';

// Context
import { useAuth } from '../contexts/AuthContext';
import { colors, typography } from '../constants/theme';

// Define types for our stack navigators
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
  SubscriberOnboarding: undefined;
  ApplicantOnboarding: undefined;
  Welcome: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  AppTabs: undefined;
  DocumentUpload: undefined;
  ApplicationDetails: undefined;
  SubscriptionManagement: undefined;
  ImpactDetails: undefined;
  Profile: undefined;
  SupportInfo: undefined;
  PremiumImpact: undefined;
  PremiumResources: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Community: undefined;
  Settings: undefined;
};

// Create navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

// Main tabs navigator with iOS-native styling
const MainTabsNavigator = () => {
  return (
    <MainTabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          height: Platform.OS === 'ios' ? 88 : 60, // Taller for iOS to accommodate home indicator
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: colors.border.strong,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontFamily: typography.fonts.medium,
          fontSize: 10,
          marginTop: 0,
        },
        headerShown: false,
      }}
    >
      <MainTabs.Screen
        name="Home"
        component={HomeScreen}
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={24} 
            />
          ),
        })}
      />
      <MainTabs.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
};

// Auth navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <AuthStack.Screen name="SubscriberOnboarding" component={SubscriberOnboardingScreen} />
      <AuthStack.Screen name="ApplicantOnboarding" component={ApplicantOnboardingScreen} />
    </AuthStack.Navigator>
  );
};

// App navigator
const AppNavigator = () => {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName="MainTabs"
    >
      <AppStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <AppStack.Screen name="AppTabs" component={MainTabsNavigator} />
      <AppStack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <AppStack.Screen 
        name="ApplicationDetails" 
        component={PlaceholderScreen} 
        options={{ title: 'Application Details' }}
      />
      <AppStack.Screen 
        name="SubscriptionManagement" 
        component={PlaceholderScreen} 
        options={{ title: 'Manage Subscription' }}
      />
      <AppStack.Screen 
        name="SupportInfo" 
        component={SupportInfoScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal',
          animationTypeForReplace: 'push'
        }} 
      />
      <AppStack.Screen 
        name="ImpactDetails" 
        component={PlaceholderScreen} 
        options={{ title: 'Your Impact' }}
      />
      <AppStack.Screen 
        name="PremiumImpact" 
        component={ImpactDashboard}
        options={{ title: 'Impact Dashboard' }} 
      />
      <AppStack.Screen 
        name="PremiumResources" 
        component={ResourceLibrary}
        options={{ title: 'Premium Resources' }} 
      />
      <AppStack.Screen name="Profile" component={SettingsScreen} />
    </AppStack.Navigator>
  );
};

// Placeholder screen for screens not yet implemented
const PlaceholderScreen = ({ route }: any) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>{route.name}</Text>
    <Text style={styles.placeholderText}>This screen is under development</Text>
  </View>
);

// Intelligent role-based Community screen that shows the appropriate community based on user role
const CommunityScreen = () => {
  const { user } = useAuth();
  
  // In a production app, this would check the user's role in a more robust way
  const userRole = user?.userType || 'anonymous';
  const isDonor = userRole === 'subscriber' || userRole === 'donor';
  const isApplicant = userRole === 'applicant';
  
  // Show the correct community based on user role
  if (isDonor) {
    return <DonorCircleScreen />;
  } else if (isApplicant) {
    return <SupportNetworkScreen />;
  }
  
  // Default view for users who don't have a role yet
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>Join Our Community</Text>
      <Text style={styles.placeholderText}>
        Make a donation to join our Donor Circle or submit your application to access Support Network.
      </Text>
      <View style={styles.communityButtonsContainer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Make a Donation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Enterprise-grade Root Navigator with comprehensive state management
export const RootNavigator = () => {
  // Get full auth state including isAuthenticated flag, not just user object
  // IMPORTANT: All hooks must be called at the top level to follow React Rules of Hooks
  const { user, isLoading, isAuthenticated, error, clearError } = useAuth();
  
  // Track navigation state for diagnostics
  const [navigationState, setNavigationState] = React.useState<string>('initializing');

  // Add detailed diagnostic logging for navigation routing
  React.useEffect(() => {
    // Enhanced logging with more detailed user information
    console.log('RootNavigator auth state:', { 
      hasUser: !!user, 
      userID: user?.userId || 'none',
      email: user?.email || 'none',
      userType: user?.userType || 'none',
      isAuthenticated,
      isLoading,
      hasError: !!error,
      navigationState
    });
  }, [user, isAuthenticated, isLoading, error, navigationState]);

  // Create a React Navigation reference to handle navigation programmatically
  const navigationRef = React.useRef<any>(null);
  
  // React Navigation state update handler
  const onNavigationStateChange = React.useCallback((state: any) => {
    // Log navigation state changes for debugging
    console.log('Navigation state changed');
  }, []);
  
  React.useEffect(() => {
    if (!isLoading) {
      // Update navigation state for diagnostics
      if (isAuthenticated && user) {
        setNavigationState('authenticated');
      } else if (user && !isAuthenticated) {
        setNavigationState('partial-auth');
      } else {
        setNavigationState('unauthenticated');
      }
      
      console.log('Navigation container auth state changed:', navigationState);
    }
  }, [isAuthenticated, isLoading, user, navigationState]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.black} />
        <Text style={styles.loadingText}>Loading your session...</Text>
      </View>
    );
  }
  
  // Handle error state with properly styled error UI
  if (error) {
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.placeholderTitle}>Authentication Error</Text>
        <Text style={styles.placeholderText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => {
            // Simply call the function we already obtained at the component level
            clearError();
          }}
        >
          <Text style={styles.errorButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={onNavigationStateChange}
    >
      {/* 
        Explicitly use isAuthenticated flag rather than just checking for user object
        This ensures proper navigation state based on authentication status
      */}
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  placeholderTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.sectionHeading,
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  communityButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: typography.fonts.medium,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 150,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.black,
    fontFamily: typography.fonts.medium,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    textAlign: 'center',
  },
});

export default RootNavigator;
