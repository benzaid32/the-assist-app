import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import { colors, typography, globalStyles } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatPhoneNumber } from '../../utils/formatters';
import { User, UserType } from '../../types/auth';

type ProfileData = {
  userType: UserType;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profileImageUrl?: string;
};

/**
 * Profile screen component with user information management
 * Allows users to view and update their profile information
 */
export const ProfileScreen = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }
      
      // In a production app, this would fetch user profile data from Firestore
      // For now, we'll use the user data from AuthContext and mock additional profile fields
      const mockProfileData: ProfileData = {
        userType: user.userType,
        name: user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      };
      
      setProfileData(mockProfileData);
      setEditedData(mockProfileData);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  // Handle input changes in edit mode
  const handleInputChange = (field: keyof ProfileData, value: string) => {
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
      // For now, we'll simulate a successful update
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Your Profile</Text>
            {!isEditing ? (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={22} color={colors.white} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={handleCancelEdit}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, isSaving && styles.disabledButton]} 
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color={colors.white} />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.profileImageContainer}>
            {profileData?.profileImageUrl ? (
              <Image 
                source={{ uri: profileData.profileImageUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageInitial}>
                  {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>
              {profileData?.userType === UserType.SUBSCRIBER ? 'Subscriber' : 'Applicant'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.textInput}
                    value={editedData?.name || ''}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.secondaryText}
                  />
                ) : (
                  <Text style={styles.inputValue}>{profileData?.name || 'Not provided'}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <Text style={styles.inputValue}>{profileData?.email || user?.email || 'Not provided'}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.textInput}
                    value={editedData?.phone || ''}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.inputValue}>
                    {profileData?.phone ? formatPhoneNumber(profileData.phone) : 'Not provided'}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Address</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street Address</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.textInput}
                    value={editedData?.address || ''}
                    onChangeText={(text) => handleInputChange('address', text)}
                    placeholder="Enter your street address"
                    placeholderTextColor={colors.secondaryText}
                  />
                ) : (
                  <Text style={styles.inputValue}>{profileData?.address || 'Not provided'}</Text>
                )}
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>City</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.textInput}
                      value={editedData?.city || ''}
                      onChangeText={(text) => handleInputChange('city', text)}
                      placeholder="City"
                      placeholderTextColor={colors.secondaryText}
                    />
                  ) : (
                    <Text style={styles.inputValue}>{profileData?.city || 'Not provided'}</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>State</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.textInput}
                      value={editedData?.state || ''}
                      onChangeText={(text) => handleInputChange('state', text)}
                      placeholder="State"
                      placeholderTextColor={colors.secondaryText}
                      maxLength={2}
                    />
                  ) : (
                    <Text style={styles.inputValue}>{profileData?.state || 'Not provided'}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ZIP Code</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.textInput}
                    value={editedData?.zipCode || ''}
                    onChangeText={(text) => handleInputChange('zipCode', text)}
                    placeholder="ZIP Code"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                ) : (
                  <Text style={styles.inputValue}>{profileData?.zipCode || 'Not provided'}</Text>
                )}
              </View>
            </View>

            {/* Account Management Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Account Management</Text>
              
              <TouchableOpacity style={styles.accountActionButton}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.primaryText} />
                <Text style={styles.accountActionText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.accountActionButton}>
                <Ionicons name="mail-outline" size={20} color={colors.primaryText} />
                <Text style={styles.accountActionText}>Email Preferences</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.accountActionButton}>
                <Ionicons name="shield-outline" size={20} color={colors.primaryText} />
                <Text style={styles.accountActionText}>Privacy Settings</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  screenTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.primaryText,
  },
  editButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    marginLeft: 4,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.secondaryText,
  },
  saveButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    marginLeft: 4,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitial: {
    fontFamily: typography.fonts.bold,
    fontSize: 40,
    color: colors.white,
  },
  changePhotoButton: {
    marginTop: 10,
  },
  changePhotoText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.accent,
  },
  userTypeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userTypeLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.white,
    backgroundColor: colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
    marginBottom: 6,
  },
  inputValue: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  textInput: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroupHalf: {
    width: '48%',
  },
  accountActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountActionText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    flex: 1,
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.error,
  },
});
