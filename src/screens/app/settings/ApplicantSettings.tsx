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
  TextInput,
  RefreshControl
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
import ApplicationStatusCard from './components/ApplicationStatusCard';
import { UserType } from '../../../types/auth';
import { ProfileService, ProfileData } from '../../../services/api/profileService';

// Types for applicant settings
type ApplicantSettingsProps = {
  user: any; // Replace with proper User type
};

/**
 * ApplicantSettings component that displays settings specific to applicants
 * Shows application status, document upload status, and account settings
 */
const ApplicantSettings = ({ user }: ApplicantSettingsProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  
  // State management
  const [isLoading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>({});
  const [editedData, setEditedData] = useState<any>({});
  
  // Animation state
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.userId) {
        throw new Error('User information is missing');
      }
      
      // Get the real profile data from our ProfileService
      const data = await ProfileService.getProfileData(user.userId, UserType.APPLICANT);
      
      // Merge with any applicant-specific data for the application status card
      const enhancedData = {
        ...data,
        applicationStatus: 'under_review', // This would be fetched from Firestore in production
        documents: {
          id: { status: 'verified', uploadedAt: '2023-05-01' },
          proofOfAddress: { status: 'pending', uploadedAt: '2023-05-02' },
          incomeVerification: { status: 'required', uploadedAt: null }
        },
        requestAmount: 1200,
        requestType: 'rent',
        submittedAt: '2023-05-01',
      };
      
      setProfileData(enhancedData);
      setEditedData(enhancedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load your profile. Please try again.');
      Alert.alert('Error', 'Failed to load your profile. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchProfileData();
  }, [user]);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProfileData();
  };

  // Handle input changes in edit mode
  const handleInputChange = (field: string, value: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (!user || !user.userId || !editedData) {
        throw new Error('Missing user information or profile data');
      }
      
      // Create a complete profile object with all fields
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
      await fetchProfileData();
      
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
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
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
            
            {/* Application Status Card */}
            <ApplicationStatusCard 
              status={profileData.applicationStatus}
              requestAmount={profileData.requestAmount}
              requestType={profileData.requestType}
              submittedAt={profileData.submittedAt}
            />
            
            {/* Documents Card */}
            <DocumentsCard 
              documents={profileData.documents}
              navigation={navigation}
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
            <AccountSettingsCard 
              email={profileData.email || user.email}
              navigation={navigation}
            />
            
            {/* Logout Button */}
            <LogoutButton onLogout={logout} />
            
            {/* Footer */}
            <Footer />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 100,
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  changePhotoText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primaryText,
  },
});

export default ApplicantSettings;
