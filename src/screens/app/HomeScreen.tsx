import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography } from '../../constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

/**
 * Enterprise-grade HomeScreen component with Apple-like minimalist design
 * Shows subscription amount, contribution progress, and community feed
 * Follows black and white minimalist aesthetic with clean typography
 */
export const HomeScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);

  // Mock data for the dashboard with proper typing
  const [dashboardData] = useState({
    subscriptionAmount: 10,
    totalContribution: 42000,
    goalAmount: 50000,
    impactStats: {
      peopleHelped: 312,
      successRate: 94
    },
    communityFeed: [
      {
        id: '1',
        message: 'The assistance helped me keep my apartment during a difficult time. I\'m forever grateful to the subscribers who made this possible.',
        date: '2 days ago'
      },
      {
        id: '2',
        message: 'Thank you to everyone who contributed. I was able to keep my utilities on during a medical emergency.',
        date: '5 days ago'
      },
      {
        id: '3',
        message: 'I can focus on my studies now without worrying about my tuition payment. Thank you all!',
        date: '1 week ago'
      }
    ]
  });

  // Load initial data
  useEffect(() => {
    // Enterprise-grade implementation would fetch data from API
    // For now we'll simulate loading
    loadDashboardData();
  }, []);

  // Function to load dashboard data with proper error handling
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would fetch data from Firebase
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Create dynamic header opacity for scrolling effect
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Calculate progress percentage
  const progressPercentage = (dashboardData.totalContribution / dashboardData.goalAmount) * 100;

  // Loading state
  if (loading && !refreshing) {
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
          <MaterialIcons name="error-outline" size={64} color={colors.black} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={loadDashboardData}
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
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle}>Home</Text>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.black}
          />
        }
      >
        {/* Subscription Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Subscription</Text>
          </View>
          <View style={styles.subscriptionContainer}>
            <Text style={styles.subscriptionAmount}>${dashboardData.subscriptionAmount}</Text>
            <Text style={styles.subscriptionPeriod}>per month</Text>
          </View>
          <Text style={styles.subscriptionInfo}>
            Thank you for your continued support. Your subscription directly helps people in need.
          </Text>
        </View>
        
        {/* Contribution Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Community Goal</Text>
            <TouchableOpacity>
              <Text style={styles.cardAction}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelStart}>${dashboardData.totalContribution / 1000}K</Text>
              <Text style={styles.progressLabelEnd}>${dashboardData.goalAmount / 1000}K</Text>
            </View>
          </View>
        </View>
        
        {/* Impact Stats Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Impact</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dashboardData.impactStats.peopleHelped}</Text>
              <Text style={styles.statLabel}>People Helped</Text>
              <Text style={styles.statInfo}>This Month</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dashboardData.impactStats.successRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
              <Text style={styles.statInfo}>Verified Assistance</Text>
            </View>
          </View>
        </View>
        
        {/* Share Card */}
        <TouchableOpacity style={styles.shareCard}>
          <View style={styles.shareContent}>
            <Ionicons name="share-social-outline" size={24} color={colors.white} />
            <Text style={styles.shareText}>Share your contribution impact</Text>
          </View>
        </TouchableOpacity>
        
        {/* Community Feed */}
        <View style={styles.feedCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Community Feed</Text>
            <TouchableOpacity>
              <Text style={styles.cardAction}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.communityFeed.map(item => (
            <View key={item.id} style={styles.feedItem}>
              <View style={styles.feedItemHeader}>
                <View style={styles.feedItemAvatar}>
                  <Text style={styles.feedItemInitial}>A</Text>
                </View>
                <Text style={styles.feedItemDate}>{item.date}</Text>
              </View>
              <Text style={styles.feedItemText}>{item.message}</Text>
              <View style={styles.feedItemFooter}>
                <TouchableOpacity style={styles.feedItemAction}>
                  <Ionicons name="heart-outline" size={18} color={colors.secondaryText} />
                  <Text style={styles.feedItemActionText}>Support</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loader: {
    marginBottom: 12,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondaryText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.black,
    marginVertical: 12,
  },
  errorText: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: colors.black,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minWidth: 200,
  },
  primaryButtonText: {
    ...typography.buttonText,
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: colors.background,
    zIndex: 10,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.black,
  },
  cardAction: {
    ...typography.buttonText,
    color: colors.black,
  },
  subscriptionContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  subscriptionAmount: {
    ...typography.h1,
    color: colors.black,
    fontSize: 42,
  },
  subscriptionPeriod: {
    ...typography.body,
    color: colors.secondaryText,
    marginLeft: 6,
  },
  subscriptionInfo: {
    ...typography.body,
    color: colors.secondaryText,
    marginTop: 8,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabelStart: {
    ...typography.caption,
    color: colors.black,
  },
  progressLabelEnd: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statNumber: {
    ...typography.h2,
    color: colors.black,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.body,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 2,
  },
  statInfo: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  shareCard: {
    backgroundColor: colors.black,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  shareContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  shareText: {
    ...typography.buttonText,
    color: colors.white,
    marginLeft: 8,
  },
  feedCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  feedItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 16,
  },
  feedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedItemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedItemInitial: {
    ...typography.body,
    color: colors.black,
    fontWeight: '500',
  },
  feedItemDate: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  feedItemText: {
    ...typography.body,
    color: colors.black,
    lineHeight: 22,
  },
  feedItemFooter: {
    marginTop: 12,
    flexDirection: 'row',
  },
  feedItemAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedItemActionText: {
    ...typography.caption,
    color: colors.secondaryText,
    marginLeft: 4,
  },
});
