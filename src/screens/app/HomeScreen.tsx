import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
  LayoutAnimation,
  AccessibilityInfo,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography } from '../../constants/theme';

// Import components and hooks from home feature module
import {
  HomeHeader,
  ImpactSummaryCard,
  SuggestedActionsCard,
  CommunityCard,
  MilestoneCard,
  useHomeData,
  LoadingState,
  ImpactData
} from '../../features/home';

// Prop types for our components with proper typing
interface SuggestedActionsCardProps {
  actions: Array<{
    id: string;
    type: 'donate' | 'share' | 'community' | 'profile';
    label: string;
    description: string;
    completed: boolean;
    priority: number;
  }>;
  navigation: any;
  disabled?: boolean;
  onActionBlocked?: () => void;
}

/**
 * HomeScreen - The primary dashboard component for authenticated users.
 * Follows enterprise-grade architecture with modular components and proper
 * separation of concerns. Includes comprehensive error handling,
 * accessibility support, and proper state management.
 */
/**
 * HomeScreen - Primary dashboard component for authenticated users
 * Enterprise-grade implementation following iOS design guidelines
 */
const HomeScreen: React.FC = () => {
  // Hooks and context
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    dashboardData, 
    loadingState, 
    errorMessage, 
    refreshData 
  } = useHomeData();

  // UI state with proper initialization
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState<boolean>(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Memoized device metrics for optimal performance
  const { width } = useMemo(() => Dimensions.get('window'), []);
  const isSmallDevice = useMemo(() => width < 375, [width]);
  const isLargeDevice = useMemo(() => width >= 428, [width]);

  // Check for reduced motion preference (WCAG 2.1 compliance)
  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        const isReducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        setReducedMotionEnabled(isReducedMotionEnabled);
        
        // Apply appropriate animation preset based on user preference
        if (Platform.OS === 'ios' && !isReducedMotionEnabled) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
      } catch (error) {
        console.error('Error checking motion preference:', error);
        setReducedMotionEnabled(false);
      }
    };
    
    checkReducedMotion();
    
    // Show onboarding for first-time users
    if (user && !user.metadata?.lastLoginAt) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Handle pull-to-refresh with proper loading state management
  const handleRefresh = useCallback(() => {
    if (loadingState === 'refreshing') return;
    
    setIsRefreshing(true);
    refreshData();
    // Reset refreshing state after a short delay for UI feedback
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [loadingState, refreshData]);
  
  // Handle primary action button press
  const handleDonatePress = useCallback(() => {
    navigation.navigate('SupportInfo' as never);
  }, [navigation]);
  
  // Enterprise-grade loading state with proper iOS-native spinner
  if (loadingState === 'initial') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Comprehensive error handling with proper iOS-native styling
  if (loadingState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface.primary} />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.feedback.error} />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{errorMessage || 'Failed to load dashboard data'}</Text>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={refreshData}
            accessibilityLabel="Retry loading"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Authentication flow integration
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} testID="home-screen-unauthenticated">
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface.primary} />
        <View style={styles.unauthContainer}>
          <MaterialIcons 
            name="account-circle" 
            size={64} 
            color={colors.accent.primary}
            accessibilityLabel="Account icon" 
          />
          <Text style={[typography.styles.title2, styles.unauthTitle]}>
            Welcome to The Assist App
          </Text>
          <Text style={[typography.styles.body, styles.unauthDescription]}>
            Please log in to view your personalized dashboard and contribute to our mission.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login' as never)}
            accessibilityLabel="Go to login"
            accessibilityRole="button"
            accessible={true}
          >
            <Text style={[typography.styles.button, styles.primaryButtonText]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.outlineButton}
            onPress={() => navigation.navigate('Signup' as never)}
            accessibilityLabel="Create an account"
            accessibilityRole="button"
            accessible={true}
          >
            <Text style={[typography.styles.button, styles.outlineButtonText]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Onboarding overlay with iOS-native sheet design
  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface.primary} />
        <View style={styles.onboardingContainer}>
          <View style={styles.onboardingCard}>
            <Text style={[typography.styles.title2, styles.onboardingTitle]}>Welcome to The Assist App</Text>
            <Text style={[typography.styles.body, styles.onboardingDescription]}>
              We're thrilled to have you join our community! Complete your profile to get the most out of your experience.
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => {
                setShowOnboarding(false);
                navigation.navigate('Profile' as never);
              }}
              accessibilityLabel="Complete your profile"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Complete Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => setShowOnboarding(false)}
              accessibilityLabel="Skip for now"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Text style={styles.outlineButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Main authenticated dashboard UI with modular components
  // Check if the user has an active donation
  const hasActiveDonation = user?.metadata?.hasActiveSubscription === true;
  
  return (
    <SafeAreaView style={styles.container} testID="home-screen-dashboard">
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.primary} />
      
      {/* Header component from home feature */}
      <HomeHeader 
        user={user}
        scrollY={scrollY}
        reducedMotionEnabled={reducedMotionEnabled}
        isSmallDevice={isSmallDevice}
        isLargeDevice={isLargeDevice}
      />
      
      {/* Main scrollable content with smooth animations */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {
          paddingHorizontal: isSmallDevice ? 12 : isLargeDevice ? 24 : 16,
          paddingBottom: isLargeDevice ? 32 : 24,
        }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
            progressBackgroundColor={colors.surface.secondary}
            accessibilityLabel="Pull to refresh your dashboard"
          />
        }
      >
        {/* First-time user onboarding overlay - conditionally rendered */}
        {showOnboarding && (
          <View style={styles.onboardingContainer}>
            <View style={styles.onboardingCard}>
              <Text style={[typography.styles.title3, styles.onboardingTitle]}>
                Welcome to Your Impact Dashboard
              </Text>
              <Text style={[typography.styles.body, styles.onboardingDescription]}>
                Here you'll track your contributions, view your impact, and connect with our community.
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  if (!reducedMotionEnabled) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  }
                  setShowOnboarding(false);
                }}
                accessibilityLabel="Get started"
                accessibilityRole="button"
                accessible={true}
              >
                <Text style={[typography.styles.button, styles.primaryButtonText]}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Welcome & Donate Banner - only for users without active donations */}
        {!hasActiveDonation && (
          <View style={styles.donatePromptCard}>
            <View style={styles.donatePromptIcon}>
              <Ionicons name="heart-outline" size={isSmallDevice ? 24 : 32} color="#F57C00" />
            </View>
            <Text style={[styles.donatePromptTitle, isSmallDevice && styles.smallDeviceText]}>Complete Your Subscription</Text>
            <Text style={[styles.donatePromptText, isSmallDevice && styles.smallDeviceText]}>
              Make your first donation to unlock all features and start making an impact.
            </Text>
            <TouchableOpacity 
              style={styles.donateButton}
              onPress={handleDonatePress}
              accessibilityLabel="Donate now"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Text style={styles.donateButtonText}>Donate Now</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Impact Summary Card from home feature */}
        <View style={[styles.cardContainer, !hasActiveDonation && styles.disabledCardContainer]}>
          <ImpactSummaryCard
            totalContribution={dashboardData.totalContribution}
            goalAmount={dashboardData.goalAmount}
            peopleHelped={dashboardData.impactStats.peopleHelped}
            successRate={dashboardData.impactStats.successRate}
            onDonatePress={handleDonatePress}
          />
          
          {/* Overlay for non-donating users */}
          {!hasActiveDonation && (
            <View style={styles.cardOverlay}>
              <TouchableOpacity 
                style={styles.unlockButton}
                onPress={handleDonatePress}
              >
                <Ionicons name="lock-closed" size={24} color={colors.white} />
                <Text style={styles.unlockButtonText}>Donate to Access</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Suggested Actions Card from home feature */}
        <SuggestedActionsCard
          actions={dashboardData.suggestedActions}
          navigation={navigation}
          disabled={!hasActiveDonation}
          onActionBlocked={handleDonatePress}
        />
        
        {/* Community Card from home feature - always visible but with content lock */}
        <View style={[styles.cardContainer, !hasActiveDonation && styles.disabledCardContainer]}>
          <CommunityCard 
            navigation={navigation}
          />
          
          {/* Overlay for non-donating users */}
          {!hasActiveDonation && (
            <View style={styles.cardOverlay}>
              <TouchableOpacity 
                style={styles.unlockButton}
                onPress={handleDonatePress}
              >
                <Ionicons name="lock-closed" size={24} color={colors.white} />
                <Text style={styles.unlockButtonText}>Donate to Access Community</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Milestone Card from home feature */}
        <View style={[styles.cardContainer, !hasActiveDonation && styles.disabledCardContainer]}>
          <MilestoneCard
            milestone={dashboardData.nextMilestone}
            progress={dashboardData.userProgress}
          />
          
          {/* Overlay for non-donating users */}
          {!hasActiveDonation && (
            <View style={styles.cardOverlay}>
              <TouchableOpacity 
                style={styles.unlockButton}
                onPress={handleDonatePress}
              >
                <Ionicons name="lock-closed" size={24} color={colors.white} />
                <Text style={styles.unlockButtonText}>Donate to Track Milestones</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Add bottom padding to account for tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Enterprise-grade styled components with accessibility and iOS-native design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  // Card container and overlay styles
  cardContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  disabledCardContainer: {
    opacity: 0.9,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  unlockButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    marginLeft: 8,
  },
  // Donate prompt styles
  donatePromptCard: {
    backgroundColor: '#FFF8E1', // Light yellow background
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  donatePromptIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 167, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  donatePromptTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title3,
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  donatePromptText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  donateButton: {
    backgroundColor: colors.black,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donateButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    textAlign: 'center',
  },
  smallDeviceText: {
    fontSize: typography.fontSizes.footnote,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface.primary,
  },
  loadingText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheadline,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: -0.24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface.primary,
  },
  errorTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.title3,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    paddingHorizontal: 24,
  },
  unauthTitle: {
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthDescription: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  onboardingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 24,
  },
  onboardingCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  onboardingTitle: {
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  onboardingDescription: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF', // White text on accent background
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.accent.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 8,
  },
  outlineButtonText: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
});

export { HomeScreen };