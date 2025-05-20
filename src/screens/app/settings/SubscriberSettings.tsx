import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  RefreshControl,
  SafeAreaView,
  Linking
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import firebase from 'firebase/compat/app';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ProfileService, ProfileData } from '../../../services/api/profileService';
import { User } from '../../../types/auth';

// Define a comprehensive navigation type for the iOS-native settings screen
type AppStackParamList = {
  MainTabs: undefined;
  AppTabs: undefined;
  DocumentUpload: undefined;
  ApplicationDetails: undefined;
  SubscriptionManagement: undefined;
  ImpactDetails: undefined;
  Profile: undefined;
  SupportInfo: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  AccountDetails: undefined;
  Notifications: undefined;
  DonationHistory: undefined;
};

// Types for subscriber settings with proper typing
type SubscriberSettingsProps = {
  user: User;
};

// Type for section data
type SettingsSection = {
  title: string;
  data: SettingsItem[];
};

type SettingsItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  rightText?: string;
  rightIcon?: string;
  hasToggle?: boolean;
  isToggled?: boolean;
  onPress: () => void;
  isDestructive?: boolean;
};

/**
 * SubscriberSettingsScreen
 * Completely redesigned to match Apple's iOS design guidelines
 * Uses a clean, minimalist black and white aesthetic
 * Implements enterprise-grade architecture and error handling
 */
const SubscriberSettings = ({ user }: SubscriberSettingsProps) => {
  // Navigation and auth hooks
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { logout } = useAuth();
  
  // State management - following iOS patterns
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });
  
  // Header title opacity for iOS-like behavior
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [60, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // Track if user has made a donation
  const hasDonated = profileData?.subscriptionDetails?.tier !== 'Free';
  
  // Focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
      return () => {};
    }, [user])
  );
  
  // Fetch user profile data with optimized error handling
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.userId) {
        throw new Error('User information is missing');
      }
      
      // Fetch real profile data from Firestore using the ProfileService
      const data = await ProfileService.getProfileData(user.userId, user.userType);
      
      // Set the profile data in the component state
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load your profile');
      
      // If there's an error fetching data, set default profile data
      const emptyProfileData: ProfileData = {
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        email: user.email,
        subscriptionDetails: {
          tier: 'Free',
          amount: 0,
          startDate: new Date().toISOString().split('T')[0],
          nextPaymentDate: ''
        },
        impact: {
          totalContributed: 0,
          peopleHelped: 0,
          joinedSince: new Date().toISOString().split('T')[0]
        }
      };
      
      setProfileData(emptyProfileData);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh when user pulls down
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  }, []);
  
  // Handle donation/support - open web browser to donation page
  const handleDonation = useCallback(() => {
    try {
      // Get Firebase Auth current user to pass userId
      const auth = firebase.auth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Open web browser to subscription page with userId parameter for tracking
        const webSubscriptionUrl = `https://assist-app-web.vercel.app/subscribe?userId=${currentUser.uid}&upgrade=true`;
        
        // Use Linking API to open the web browser
        Linking.openURL(webSubscriptionUrl)
          .catch(err => {
            console.error('Error opening browser for donation:', err);
            Alert.alert('Error', 'Could not open the donation page. Please try again later.');
          });
      }
    } catch (error) {
      console.error('Donation navigation error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }, []);
  
  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await logout();
              // Navigation will be handled by the auth context
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  }, [logout]);
  
  // Define settings sections in iOS style
  const getSettingsSections = useCallback((): SettingsSection[] => {
    const sections: SettingsSection[] = [
      // Subscription & Premium Features
      {
        title: 'Subscription',
        data: [
          {
            id: 'current-plan',
            title: 'Current Plan',
            subtitle: hasDonated ? 'Supporter' : 'Free',
            icon: 'star-outline',
            iconColor: colors.black,
            rightText: hasDonated ? 'Active' : 'Upgrade',
            rightIcon: 'chevron-forward',
            onPress: () => navigation.navigate('SupportInfo'),
          },
          {
            id: 'donation',
            title: hasDonated ? 'Make Another Donation' : 'Support With Donation',
            subtitle: 'Any amount unlocks premium features',
            icon: 'heart-outline',
            iconColor: '#FF2D55', // iOS red heart color
            rightIcon: 'chevron-forward',
            onPress: handleDonation,
          },
          {
            id: 'impact-dashboard',
            title: 'Impact Dashboard',
            subtitle: hasDonated ? 'View your impact' : 'Donate to unlock',
            icon: 'analytics-outline',
            iconColor: colors.black,
            rightIcon: 'chevron-forward',
            onPress: () => {
              if (hasDonated) {
                navigation.navigate('ImpactDetails');
              } else {
                handleDonation();
              }
            },
          },
        ],
      },
      
      // Account Settings
      {
        title: 'Account',
        data: [
          {
            id: 'personal-info',
            title: 'Personal Information',
            icon: 'person-outline',
            iconColor: colors.black,
            rightIcon: 'chevron-forward',
            onPress: () => navigation.navigate('Profile'),
          },
          {
            id: 'notifications',
            title: 'Notifications',
            icon: 'notifications-outline',
            iconColor: colors.black,
            rightIcon: 'chevron-forward',
            onPress: () => navigation.navigate('Notifications'),
          },
          {
            id: 'privacy',
            title: 'Privacy & Security',
            icon: 'shield-outline',
            iconColor: colors.black,
            rightIcon: 'chevron-forward',
            onPress: () => navigation.navigate('PrivacyPolicy'),
          },
        ],
      },
      
      // Support & About
      {
        title: 'Support',
        data: [
          {
            id: 'help',
            title: 'Help & Support',
            icon: 'help-circle-outline',
            iconColor: colors.black,
            rightIcon: 'chevron-forward',
            onPress: () => navigation.navigate('SupportInfo'),
          },
          {
            id: 'terms',
            title: 'Terms of Service',
            icon: 'document-text-outline',
            iconColor: colors.black,
            rightIcon: 'chevron-forward',
            onPress: () => navigation.navigate('TermsOfService'),
          },
          {
            id: 'about',
            title: 'About',
            icon: 'information-circle-outline',
            iconColor: colors.black,
            rightIcon: 'chevron-forward',
            onPress: () => Alert.alert('About', 'The Assist App v1.0.0\n© 2025 Assist Innovations'),
          },
        ],
      },
      
      // Logout (separate section at bottom)
      {
        title: '',
        data: [
          {
            id: 'logout',
            title: 'Log Out',
            icon: 'log-out-outline',
            iconColor: '#FF3B30', // iOS red color
            onPress: handleLogout,
            isDestructive: true,
          },
        ],
      },
    ];
    
    return sections;
  }, [navigation, hasDonated, handleDonation, handleLogout]);

  // Render a single setting item in iOS style
  const renderSettingItem = useCallback((item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          item.isDestructive && styles.destructiveItem
        ]}
        onPress={item.onPress}
        activeOpacity={0.6}
      >
        <View style={styles.settingIconContainer}>
          <Ionicons 
            name={item.icon as any} 
            size={22} 
            color={item.iconColor || colors.black} 
          />
        </View>
        
        <View style={styles.settingContent}>
          <View>
            <Text style={[styles.settingTitle, item.isDestructive && styles.destructiveText]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>
                {item.subtitle}
              </Text>
            )}
          </View>
          
          <View style={styles.settingRight}>
            {item.rightText && (
              <Text style={[
                styles.settingRightText,
                item.rightText === 'Upgrade' && styles.upgradeText
              ]}>
                {item.rightText}
              </Text>
            )}
            {item.rightIcon && (
              <Ionicons 
                name={item.rightIcon as any} 
                size={16} 
                color={colors.secondaryText} 
              />
            )}
            {item.hasToggle && (
              <View style={[
                styles.toggle,
                item.isToggled && styles.toggleActive
              ]} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);
  
  // Render a section of settings
  const renderSection = useCallback((section: SettingsSection, index: number) => {
    return (
      <View key={`section-${index}`} style={styles.settingSection}>
        {section.title ? (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        ) : null}
        
        <View style={styles.sectionContent}>
          {section.data.map(renderSettingItem)}
        </View>
      </View>
    );
  }, [renderSettingItem]);

  // Loading state with iOS-style activity indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get settings sections based on current state
  const settingsSections = getSettingsSections();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* iOS-style animated header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: headerOpacity }
        ]}
      >
        <Animated.Text 
          style={[
            styles.headerTitle,
            { opacity: headerTitleOpacity }
          ]}
        >
          Settings
        </Animated.Text>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.black]}
            tintColor={colors.black}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Profile header with avatar */}
        <View style={styles.profileHeaderContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          <Text style={styles.userName}>
            {profileData?.name || 'User'}
          </Text>
          
          <Text style={styles.userEmail}>
            {profileData?.email || ''}
          </Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* iOS-style grouped settings */}
        {settingsSections.map(renderSection)}
        
        {/* App version information */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>The Assist App v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Assist Innovations</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Core layout styles
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS system background color
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Header styles (iOS-style navbar)
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)', // Very subtle iOS-style border
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7', // iOS system background
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.secondaryText,
    fontWeight: '400',
  },
  
  // Error state
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF1F0',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Profile header
  profileHeaderContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: colors.white,
    marginBottom: 30,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 16,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 16,
  },
  editProfileText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Settings sections (iOS grouped table view style)
  settingSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Setting item (iOS table cell style)
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  destructiveItem: {
    backgroundColor: colors.white,
  },
  settingIconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.black,
  },
  destructiveText: {
    color: '#FF3B30', // iOS red color
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRightText: {
    fontSize: 15,
    color: colors.secondaryText,
    marginRight: 8,
  },
  upgradeText: {
    color: '#007AFF', // iOS blue color
    fontWeight: '500',
  },
  
  // Toggle component (iOS-style)
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E9E9EA', // iOS gray switch
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#34C759', // iOS green switch
  },
  
  // Version info
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 13,
    color: colors.secondaryText,
  }
});

export default SubscriberSettings;
