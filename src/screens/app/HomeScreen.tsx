import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography } from '../../constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

/**
 * Dashboard screen component that matches the mockup UI
 * Shows subscription amount, contribution progress, and community feed
 * Enterprise-grade implementation with proper error handling and loading states
 */
export const HomeScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  // Mock data for the dashboard
  const [dashboardData] = useState({
    subscriptionAmount: 10,
    totalContribution: 42000,
    goalAmount: 50000,
    communityFeed: [
      {
        id: '1',
        message: 'An anonymous thank-you message',
        timestamp: new Date()
      },
      {
        id: '2',
        message: 'Thank you for helping with my rent this month',
        timestamp: new Date()
      }
    ]
  });

  // Load initial data
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle navigation to different tabs
  const handleNavigateToHome = () => {
    // Already on home screen
  };

  const handleNavigateToCommunity = () => {
    // In a real implementation, this would navigate to the community screen
    console.log('Navigate to community');
  };

  const handleNavigateToSettings = () => {
    // In a real implementation, this would navigate to the settings screen
    console.log('Navigate to settings');
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
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
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              setTimeout(() => setLoading(false), 1000);
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
      
      {/* Dashboard content */}
      <View style={styles.dashboardContainer}>
        {/* Header - Dashboard */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        
        {/* Subscription amount */}
        <View style={styles.subscriptionContainer}>
          <Text style={styles.subscriptionAmount}>${dashboardData.subscriptionAmount} per month</Text>
          <Text style={styles.subscriptionLabel}>Total Contribution</Text>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[styles.progressBarFill, { 
                width: `${(dashboardData.totalContribution / dashboardData.goalAmount) * 100}%` 
              }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelStart}>${dashboardData.totalContribution / 1000}K</Text>
            <Text style={styles.progressLabelEnd}>${dashboardData.goalAmount / 1000}K</Text>
          </View>
        </View>
        
        {/* Community Feed */}
        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Community Feed</Text>
          
          {dashboardData.communityFeed.map(item => (
            <View key={item.id} style={styles.feedItem}>
              <Text style={styles.feedItemText}>{item.message}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={handleNavigateToHome}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={24} color={colors.black} />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={handleNavigateToCommunity}
          activeOpacity={0.7}
        >
          <Ionicons name="people-outline" size={24} color={colors.secondaryText} />
          <Text style={styles.tabLabelInactive}>Community</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={handleNavigateToSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={colors.secondaryText} />
          <Text style={styles.tabLabelInactive}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dashboardContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title,
    color: colors.primaryText,
  },
  subscriptionContainer: {
    marginBottom: 16,
  },
  subscriptionAmount: {
    fontFamily: typography.fonts.bold,
    fontSize: 24,
    color: colors.primaryText,
    marginBottom: 4,
  },
  subscriptionLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F4A261',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabelStart: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.label,
    color: colors.secondaryText,
  },
  progressLabelEnd: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.label,
    color: colors.secondaryText,
  },
  feedContainer: {
    marginBottom: 16,
  },
  feedTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 16,
  },
  feedItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  feedItemText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.primaryText,
    marginTop: 4,
  },
  tabLabelInactive: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loader: {
    marginVertical: 16,
  },
  loadingText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title,
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.white,
  }
});

export default HomeScreen;
