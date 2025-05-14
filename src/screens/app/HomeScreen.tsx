import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, globalStyles } from '../../constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ApplicantDashboard from '../../components/dashboard/ApplicantDashboard';
import SubscriberDashboard from '../../components/dashboard/SubscriberDashboard';
import { UserType } from '../../types/auth';
import Logo from '../../components/common/Logo';

/**
 * Home screen component with dashboard functionality
 * Shows different UI based on user type (subscriber or applicant)
 * Enterprise-grade implementation with proper error handling and loading states
 */
export const HomeScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Function to load dashboard data
  const loadDashboardData = async () => {
    try {
      // In a production app, this would fetch real data from an API
      // Simulate API call with timeout
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 1500);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to load dashboard data. Please check your connection and try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    setError(null);
    loadDashboardData();
  };

  // Navigation handlers
  const handleManageSubscription = () => {
    try {
      navigation.navigate('SubscriptionManagement' as never);
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Navigation Error', 'Unable to navigate to subscription management.');
    }
  };

  const handleViewImpact = () => {
    try {
      navigation.navigate('ImpactDetails' as never);
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Navigation Error', 'Unable to navigate to impact details.');
    }
  };

  const handleUploadDocuments = () => {
    try {
      navigation.navigate('DocumentUpload' as never);
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Navigation Error', 'Unable to navigate to document upload screen.');
    }
  };

  const handleViewApplicationDetails = () => {
    try {
      navigation.navigate('ApplicationDetails' as never);
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Navigation Error', 'Unable to navigate to application details.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <Logo size="medium" />
          <ActivityIndicator size="large" color={colors.black} style={styles.loader} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>The Assist App</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              loadDashboardData();
            }}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If user is not authenticated or user data is not available
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <Logo size="medium" />
          <Text style={styles.errorText}>Please log in to continue</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header with logo and notifications */}
      <View style={styles.header}>
        <View style={styles.headerLogoContainer}>
          <Logo size="small" />
          <Text style={styles.headerTitle}>The Assist App</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>
      
      {/* Main content with pull-to-refresh */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.black}
            colors={[colors.black]}
          />
        }
      >
        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {user.displayName || 'User'}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        
        {/* Dashboard based on user type */}
        {user.userType === UserType.SUBSCRIBER ? (
          <SubscriberDashboard
            user={user}
            onManageSubscription={handleManageSubscription}
            onViewImpact={handleViewImpact}
          />
        ) : (
          <ApplicantDashboard
            user={user}
            onUploadDocuments={handleUploadDocuments}
            onViewDetails={handleViewApplicationDetails}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    ...globalStyles.container,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    marginTop: 20,
    marginBottom: 10,
  },
  loadingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginTop: 16,
    textAlign: 'center',
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title,
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Button styles
  primaryButton: {
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.black,
    minWidth: 150,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.black,
    textAlign: 'center',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.black,
    marginLeft: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Content styles
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  welcomeText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title,
    color: colors.black,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
  },
});
