import React, { useState, useEffect } from 'react';
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
  TextInput
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../App';
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

// Types for subscriber settings
type SubscriberSettingsProps = {
  user: any; // Replace with proper User type
};

/**
 * SubscriberSettings component that displays settings specific to subscribers
 * Shows subscription details, impact statistics, and account settings
 */
const SubscriberSettings = ({ user }: SubscriberSettingsProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

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
        
        // In a production app, this would fetch user profile data from Firestore
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        const mockProfileData = {
          name: user.email ? user.email.split('@')[0] : 'User',
          email: user.email || undefined,
          phone: '555-123-4567',
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          subscriptionDetails: {
            tier: 'Standard',
            amount: 10,
            startDate: '2023-05-01',
            nextPaymentDate: '2023-06-01'
          },
          impact: {
            totalContributed: 120,
            peopleHelped: 3,
            joinedSince: '2023-01-15'
          }
        };
        
        setProfileData(mockProfileData);
        setEditedData(mockProfileData);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        Alert.alert('Error', 'Failed to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Handle input changes in edit mode
  const handleInputChange = (field: string, value: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // In a production app, this would call a Firebase function to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(editedData);
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
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
        <SubscriptionCard 
          subscriptionDetails={profileData.subscriptionDetails}
          navigation={navigation}
        />
        
        {/* Impact Card */}
        <ImpactCard 
          impact={profileData.impact}
        />
        
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
    padding: 20,
  },
  loadingText: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.secondaryText,
    marginTop: 12,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitial: {
    fontFamily: typography.fonts.bold,
    fontSize: 36,
    color: colors.black,
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontFamily: typography.fonts.medium,
    fontSize: 14,
    color: colors.black,
    textDecorationLine: 'underline',
  },
});

export default SubscriberSettings;
