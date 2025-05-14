import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { SubscriberOnboardingScreen } from '../screens/auth/SubscriberOnboardingScreen';
import { ApplicantOnboardingScreen } from '../screens/auth/ApplicantOnboardingScreen';

// App Screens
import { HomeScreen } from '../screens/app/HomeScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { SettingsScreen } from '../screens/app/SettingsScreen';
import { DocumentUploadScreen } from '../screens/app/DocumentUploadScreen';

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
};

export type AppStackParamList = {
  MainTabs: undefined;
  DocumentUpload: undefined;
  ApplicationDetails: undefined;
  SubscriptionManagement: undefined;
  ImpactDetails: undefined;
  Profile: undefined;
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

// Main tabs navigator
const MainTabsNavigator = () => {
  return (
    <MainTabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fonts.medium,
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <MainTabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
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
        name="ImpactDetails" 
        component={PlaceholderScreen} 
        options={{ title: 'Your Impact' }}
      />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
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

// Community screen placeholder
const CommunityScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Community</Text>
    <Text style={styles.placeholderText}>Coming soon</Text>
  </View>
);

// Root navigator
export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
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
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
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
    fontSize: typography.fontSizes.title,
    color: colors.black,
    marginBottom: 12,
  },
  placeholderText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default RootNavigator;
