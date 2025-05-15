import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography } from '../../constants/theme';
import { UserType } from '../../types/auth';

// Import the RootStackParamList from App.tsx for proper navigation typing
import { RootStackParamList } from '../../../App';

// Define the navigation prop type for this screen
type ApplicantOnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApplicantOnboarding'>;

/**
 * Applicant Onboarding Screen
 * Collects applicant information and completes the signup process
 * Following enterprise-grade development guidelines with proper error handling
 */
export const ApplicantOnboardingScreen = () => {
  const navigation = useNavigation<ApplicantOnboardingScreenNavigationProp>();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [assistanceType, setAssistanceType] = useState<'rent' | 'utilities' | 'tuition' | ''>('');
  
  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Handle back button press
  const handleBack = () => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation error:', error);
      if (error instanceof Error) {
        console.error(`Failed to navigate back: ${error.message}`);
      }
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerificationError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setVerificationError(null);

      // In a production app, you would verify the code against Firestore
      // For now, we'll simulate verification success
      console.log(`Verifying code: ${verificationCode} for user ${userId}`);
      
      // Store additional user data
      console.log('Additional user data to store:', {
        name,
        assistanceType,
        verified: true
      });

      // Navigation will happen automatically via the AuthContext after verification
      // In a real app, you would update the user's verification status in Firestore
      
      // Simulate successful verification
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to home or success screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' }],
        });
      }, 1500);
      
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError(error instanceof Error ? error.message : 'An error occurred during verification');
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!email || !password || !name || !phone || !address || !city || !state || !zipCode || !assistanceType) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Sign up the user with proper type safety
      await signup({
        email,
        password,
        userType: UserType.APPLICANT,
      });
      
      // Store additional user profile data - this would be saved to Firestore in production
      const userProfile = {
        name,
        phone,
        address,
        city,
        state,
        zipCode,
        assistanceType,
      };
      console.log('User profile data to store:', userProfile);
      
      // For demo purposes, generate a verification code here
      // In production, this would be handled by the backend
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Verification code for testing: ${generatedCode}`);
      
      // Store the user ID for verification
      // In a real app, this would come from Firebase Auth
      setUserId('user-' + Date.now().toString());
      
      // Show verification screen
      setShowVerification(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            testID="back-button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
        
        {/* Title - Centered and larger like other screens */}
        <View style={styles.titleContainer}>
          {showVerification ? (
            <>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Applicant Details</Text>
              <Text style={styles.subtitle}>Complete your profile</Text>
            </>
          )}
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {showVerification ? (
            /* Verification Code Form */
            <>
              <Text style={styles.verificationText}>
                We've sent a 6-digit verification code to your email. Please enter it below to complete your registration.
              </Text>
              
              <Text style={styles.formLabel}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.verificationInput]}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                testID="verification-input"
              />
              
              {verificationError && (
                <Text style={styles.errorText}>{verificationError}</Text>
              )}
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleVerifyCode}
                disabled={isLoading}
                testID="verify-button"
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={() => {
                  console.log('Resending verification code...');
                  // In a real app, this would trigger a new code to be sent
                }}
                disabled={isLoading}
                testID="resend-button"
              >
                <Text style={styles.resendButtonText}>Resend Code</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Signup Form */
            <>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                testID="name-input"
              />

              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="email-input"
              />

              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="password-input"
              />
              
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                testID="phone-input"
              />
              
              <Text style={styles.formLabel}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your street address"
                value={address}
                onChangeText={setAddress}
                testID="address-input"
              />
              
              <View style={styles.rowContainer}>
                <View style={styles.halfInput}>
                  <Text style={styles.formLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                    testID="city-input"
                  />
                </View>
                
                <View style={styles.halfInput}>
                  <Text style={styles.formLabel}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={state}
                    onChangeText={setState}
                    maxLength={2}
                    autoCapitalize="characters"
                    testID="state-input"
                  />
                </View>
              </View>
              
              <Text style={styles.formLabel}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="number-pad"
                maxLength={10}
                testID="zip-input"
              />

              <Text style={styles.formLabel}>Assistance Type</Text>
              <View style={styles.assistanceContainer}>
                <TouchableOpacity 
                  style={[styles.assistanceOption, assistanceType === 'rent' && styles.assistanceOptionSelected]}
                  onPress={() => setAssistanceType('rent')}
                  testID="assistance-rent"
                >
                  <Ionicons 
                    name="home-outline" 
                    size={24} 
                    color={assistanceType === 'rent' ? colors.white : colors.primaryText} 
                  />
                  <Text style={[styles.assistanceText, assistanceType === 'rent' && styles.assistanceTextSelected]}>
                    Rent
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.assistanceOption, assistanceType === 'utilities' && styles.assistanceOptionSelected]}
                  onPress={() => setAssistanceType('utilities')}
                  testID="assistance-utilities"
                >
                  <Ionicons 
                    name="flash-outline" 
                    size={24} 
                    color={assistanceType === 'utilities' ? colors.white : colors.primaryText} 
                  />
                  <Text style={[styles.assistanceText, assistanceType === 'utilities' && styles.assistanceTextSelected]}>
                    Utilities
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.assistanceOption, assistanceType === 'tuition' && styles.assistanceOptionSelected]}
                  onPress={() => setAssistanceType('tuition')}
                  testID="assistance-tuition"
                >
                  <Ionicons 
                    name="school-outline" 
                    size={24} 
                    color={assistanceType === 'tuition' ? colors.white : colors.primaryText} 
                  />
                  <Text style={[styles.assistanceText, assistanceType === 'tuition' && styles.assistanceTextSelected]}>
                    Tuition
                  </Text>
                </TouchableOpacity>
              </View>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
                testID="submit-button"
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Continue to Documents</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Progress indicator */}
        <View style={styles.progressIndicator}>
          <View style={[styles.progressDot, styles.progressDotInactive]} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: 42, // Larger size like other screens
    color: colors.black,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold', // Maximum boldness
  },
  subtitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  formLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.formLabel,
    color: colors.primaryText,
    marginBottom: 8,
    alignSelf: 'flex-start',
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    borderRadius: 12, // More modern rounded corners
    paddingHorizontal: 16,
    paddingVertical: 14, // Slightly taller for better touch targets
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    marginBottom: 20, // More spacing between inputs
    width: '100%', // Full width
    color: colors.black,
  },
  assistanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
  },
  assistanceOption: {
    width: '48%',
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  assistanceOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  assistanceText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    letterSpacing: -0.2,
  },
  assistanceTextSelected: {
    color: colors.white,
  },
  errorText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  halfInput: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 17,
    color: colors.white,
    letterSpacing: -0.41,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.black,
    marginHorizontal: 4,
  },
  progressDotInactive: {
    backgroundColor: colors.neutralBorders,
  },
  verificationText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    lineHeight: typography.lineHeights.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  verificationInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 4,
    fontFamily: typography.fonts.semibold,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  resendButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});

export default ApplicantOnboardingScreen;
