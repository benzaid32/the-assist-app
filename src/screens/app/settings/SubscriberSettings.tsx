import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
  RefreshControl
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import firebase from 'firebase/compat/app';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoCard from './components/PersonalInfoCard';
import AddressCard from './components/AddressCard';
import AccountSettingsCard from './components/AccountSettingsCard';
import LogoutButton from './components/LogoutButton';
import Footer from './components/Footer';
import SubscriptionCard from './components/SubscriptionCard';
import ImpactCard from './components/ImpactCard';
import { ProfileService, ProfileData } from '../../../services/api/profileService';
import { User } from '../../../types/auth';

// Define a simplified navigation type for the settings screen
type AppStackParamList = {
  MainTabs: undefined;
  AppTabs: undefined;
  DocumentUpload: undefined;
  ApplicationDetails: undefined;
  SubscriptionManagement: undefined;
  ImpactDetails: undefined;
  Profile: undefined;
};

// Types for subscriber settings
type SubscriberSettingsProps = {
  user: User;
};

/**
 * SubscriberSettings component that displays settings specific to subscribers
 * Shows subscription details, impact statistics, and account settings
 */
const SubscriberSettings = ({ user }: SubscriberSettingsProps) => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Fetch user profile data
  useEffect(() => {
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
        setEditedData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your profile');
        
        // If there's an error fetching data, set empty profile data
        const emptyProfileData: ProfileData = {
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
          email: user.email,
          subscriptionDetails: {
            tier: 'Standard',
            amount: 10,
            startDate: new Date().toISOString().split('T')[0],
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          impact: {
            totalContributed: 0,
            peopleHelped: 0,
            joinedSince: new Date().toISOString().split('T')[0]
          }
        };
        
        setProfileData(emptyProfileData);
        setEditedData(emptyProfileData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Handle input changes in edit mode
  const handleInputChange = (field: string, value: string) => {
    if (editedData) {
      // For nested fields, we need to handle them differently
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        const parentValue = editedData[parentField as keyof ProfileData];
        
        if (parentValue && typeof parentValue === 'object') {
          setEditedData({
            ...editedData,
            [parentField]: {
              ...parentValue,
              [childField]: value
            }
          });
        }
      } else {
        setEditedData({
          ...editedData,
          [field]: value,
        });
      }
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (!user || !user.userId || !editedData) {
        throw new Error('Missing user information or profile data');
      }
      
      // Create a complete profile object with all fields
      // This ensures empty fields are also saved properly
      const completeProfile: Partial<ProfileData> = {
        name: editedData.name || '',
        phone: editedData.phone || '',
        address: editedData.address || '',
        city: editedData.city || '',
        state: editedData.state || '',
        zipCode: editedData.zipCode || '',
      };
      
      console.log('Saving profile with data:', completeProfile);
      
      // Save profile data to Firestore using the ProfileService
      await ProfileService.updateProfileData(user.userId, completeProfile);
      
      // Fetch fresh data to ensure everything is up to date
      try {
        const freshData = await ProfileService.getProfileData(user.userId, user.userType);
        setProfileData(freshData);
        setEditedData(freshData);
      } catch (refreshError) {
        console.error('Error refreshing profile data:', refreshError);
        // Still use the locally edited data if refresh fails
        setProfileData(editedData);
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update your profile');
      Alert.alert('Error', 'Failed to update your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing and revert changes
  const handleCancelEdit = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    if (!user || !user.userId) return;
    
    setRefreshing(true);
    try {
      const freshData = await ProfileService.getProfileData(user.userId, user.userType);
      setProfileData(freshData);
      setEditedData(freshData);
      console.log('Profile data refreshed successfully');
    } catch (err) {
      console.error('Error refreshing profile data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh your profile');
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.black} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ProfileHeader 
        headerOpacity={headerOpacity}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleCancelEdit={handleCancelEdit}
        handleSaveProfile={handleSaveProfile}
        isSaving={isSaving}
        title="Settings"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.black]}
            tintColor={colors.black}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageInitial}>
              {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Subscription Card */}
        {profileData?.subscriptionDetails && (
          <SubscriptionCard 
            subscriptionDetails={profileData.subscriptionDetails}
            navigation={navigation}
          />
        )}
        
        {/* Impact Card */}
        {profileData?.impact && (
          <ImpactCard 
            impact={profileData.impact}
          />
        )}
        
        {/* Personal Information Card */}
        <PersonalInfoCard 
          profileData={profileData}
          editedData={editedData}
          isEditing={isEditing}
          handleInputChange={handleInputChange}
        />
        
        {/* Address Card */}
        <AddressCard 
          profileData={profileData}
          editedData={editedData}
          isEditing={isEditing}
          handleInputChange={handleInputChange}
        />
        
        {/* Account Settings Card */}
        <AccountSettingsCard />
        
        {/* Logout Button */}
        <LogoutButton onLogout={handleLogout} />
        
        {/* Footer */}
        <Footer />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: typography.fonts.medium,
    marginTop: 16,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    fontFamily: typography.fonts.bold,
    fontSize: 32,
    color: colors.white,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  changePhotoText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.small,
    color: colors.accent,
  },
  errorContainer: {
    backgroundColor: colors.error + '20', // Adding transparency
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.small,
    color: colors.error,
  },
});

export default SubscriberSettings;
