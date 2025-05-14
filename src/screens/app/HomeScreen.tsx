import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, globalStyles } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ApplicantDashboard from '../../components/dashboard/ApplicantDashboard';
import SubscriberDashboard from '../../components/dashboard/SubscriberDashboard';
import { UserType } from '../../types/auth';

/**
 * Home screen component with dashboard functionality
 * Shows different UI based on user type (subscriber or applicant)
 */
export const HomeScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  // Navigation handlers
  const handleManageSubscription = () => {
    // In a real app, this would navigate to the subscription management screen
    Alert.alert('Manage Subscription', 'This would navigate to the subscription management screen.');
  };

  const handleViewImpact = () => {
    // In a real app, this would navigate to the impact details screen
    Alert.alert('View Impact', 'This would navigate to the impact details screen.');
  };

  const handleUploadDocuments = () => {
    // In a real app, this would navigate to the document upload screen
    Alert.alert('Upload Documents', 'This would navigate to the document upload screen.');
  };

  const handleViewApplicationDetails = () => {
    // In a real app, this would navigate to the application details screen
    Alert.alert('Application Details', 'This would navigate to the application details screen.');
  };

  // Loading state
  if (loading) {
    // Simulate loading delay
    setTimeout(() => setLoading(false), 1500);
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If user is not authenticated or user data is not available
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Assist App</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

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
  loadingContainer: {
    ...globalStyles.container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginTop: 16,
  },
  errorContainer: {
    ...globalStyles.container,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.error,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.primaryText,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
