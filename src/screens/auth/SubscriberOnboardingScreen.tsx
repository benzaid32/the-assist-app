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
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography } from '../../constants/theme';
import { UserType } from '../../types/auth';

// Import enterprise-grade services for authentication and user management
import { PreAuthService } from '../../services/api/preAuthService';
import { UserManagementService } from '../../services/api/userManagementService';

// Import the RootStackParamList from App.tsx for proper navigation typing
import { RootStackParamList } from '../../../App';

// Define the navigation prop type for this screen
type SubscriberOnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SubscriberOnboarding'>;

/**
 * Subscriber Onboarding Screen
 * Collects subscriber information and completes the signup process
 * Uses a clean, professional approach similar to major tech companies
 */
export const SubscriberOnboardingScreen = () => {
  const navigation = useNavigation<SubscriberOnboardingScreenNavigationProp>();
  const { login } = useAuth();
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
  
  // Verification state
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
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

  // Send verification code to email using enterprise-grade PreAuthService
  const handleSendVerificationCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Call our enterprise-grade PreAuthService to send verification code
      // This uses proper HTTP endpoints with secure error handling
      const verificationId = await PreAuthService.sendVerificationCode(
        email,
        UserType.SUBSCRIBER
      );
      
      // Store the verification ID for later steps
      setVerificationId(verificationId);
      setIsEmailSent(true);
      
      // We no longer have direct access to the code in DEV mode
      // as it's handled securely on the server
      
      // Show success alert with proper messaging
      Alert.alert(
        'Verification Code Sent',
        `A verification code has been sent to ${email}. Please check your email and enter the code below.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while sending verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify the email with the entered code using enterprise-grade PreAuthService
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerificationError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setVerificationError(null);
      
      // Use the secure PreAuthService to verify the code
      const success = await PreAuthService.verifyCode(
        verificationId,
        verificationCode
      );
      
      // Handle successful verification
      if (success) {
        setIsEmailVerified(true);
        setVerificationError('Email verified successfully! You can now complete your signup.');
      } else {
        setVerificationError('Verification failed. Please try again with the correct code.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError(error instanceof Error ? error.message : 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resending verification code with enterprise-grade service
  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      setVerificationError(null);
      
      // We'll need to request a completely new code using the original method
      const newVerificationId = await PreAuthService.sendVerificationCode(
        email,
        UserType.SUBSCRIBER
      );
      
      // Update verification ID with new one
      setVerificationId(newVerificationId);
      setVerificationCode(''); // Clear previous code
      
      // Show success message
      setVerificationError('A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Error resending code:', error);
      setVerificationError(error instanceof Error ? error.message : 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete signup after email verification using our enterprise-grade approach
  const handleCompleteSignup = async () => {
    if (!email || !password || !name || !phone || !address || !city || !state || !zipCode || !isEmailVerified) {
      setError('Please fill in all required fields and verify your email');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare user data for Cloud Function
      const userData = {
        name,
        phone,
        address,
        city,
        state,
        zipCode,
        subscriptionDetails: {
          tier: 'Free', // Default tier for new users
          amount: 0,    // No payment yet
          startDate: new Date().toISOString().split('T')[0],
          nextPaymentDate: null // No upcoming payment scheduled
        }
      };
      
      console.log('Starting enterprise-grade signup flow...');
      
      // Step 1: Create the Firebase Auth user with our Cloud Function
      const userId = await UserManagementService.createVerifiedUser(
        verificationId,
        email,
        password,
        UserType.SUBSCRIBER,
        userData
      );
      
      console.log('User created successfully, now authenticating session:', userId);
      
      // Step 2: Authenticate user with proper error handling for production environments
      try {
        // Get Firebase Auth instance
        const auth = firebase.auth();
        
        // Clear any existing auth state to prevent session conflicts
        await auth.signOut();
        
        // Sign in with proper credentials to establish session
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        if (!userCredential.user) {
          throw new Error('Authentication failed after signup. Please try logging in manually.');
        }
        
        console.log('Authentication successful, user signed in:', userCredential.user.uid);
        
        // Step 3: Get Firestore instance for session verification
        const db = firebase.firestore();
        
        // Step 4: Verify that the user document exists in Firestore with cached read
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get({ source: 'server' });
        
        if (!userDoc.exists) {
          console.warn('User document not found in Firestore after authentication. This may indicate a data consistency issue.');
        } else {
          console.log('User document found in Firestore, profile complete:', userDoc.data());
        }
        
        // Step 5: No need to manually navigate - the AuthContext will detect the authenticated state
        // and RootNavigator will automatically switch to the AppNavigator
        // This approach prevents the navigation error and follows proper authentication flow
        console.log('Signup complete - AuthContext will handle navigation to app screens');
        
        // We don't need to do anything else here - the auth state change will trigger
        // the appropriate navigation in RootNavigator
      } catch (authError) {
        console.error('Post-signup authentication error:', authError);
        setError('Account created but session authentication failed. Please try logging in manually.');
        
        // Navigate to login screen if authentication fails after account creation
        navigation.navigate('Login');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
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
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Please provide your information</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            testID="name-input"
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

          <Text style={styles.formLabel}>Email</Text>
          <View style={styles.emailContainer}>
            <TextInput
              style={[styles.input, styles.emailInput]}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
              editable={!isEmailSent} // Disable after sending verification
            />
            
            {!isEmailSent ? (
              <TouchableOpacity 
                style={styles.verifyEmailButton}
                onPress={handleSendVerificationCode}
                disabled={isLoading || !email}
                testID="send-code-button"
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.verifyEmailButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={[styles.verifyEmailButton, styles.verifiedButton]}>
                <Ionicons name={isEmailVerified ? "checkmark-circle" : "mail"} size={20} color={colors.white} />
              </View>
            )}
          </View>
          
          {isEmailSent && (
            <View style={styles.verificationCodeContainer}>
              <Text style={styles.formLabel}>Verification Code</Text>
              <View style={styles.verificationCodeInputContainer}>
                <TextInput
                  style={styles.verificationCodeInput}
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isEmailVerified}
                  testID="verification-code-input"
                />
                
                <TouchableOpacity 
                  style={[styles.verifyCodeButton, isEmailVerified && styles.disabledButton]}
                  onPress={handleVerifyCode}
                  disabled={isLoading || isEmailVerified || !verificationCode}
                  testID="verify-code-button"
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.verifyCodeButtonText}>{isEmailVerified ? 'Verified' : 'Verify'}</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {!isEmailVerified && (
                <TouchableOpacity 
                  style={styles.resendCodeButton}
                  onPress={handleResendCode}
                  disabled={isLoading}
                  testID="resend-code-button"
                >
                  <Text style={styles.resendCodeButtonText}>Resend Code</Text>
                </TouchableOpacity>
              )}
              
              {verificationError && (
                <Text style={[styles.verificationErrorText, isEmailVerified && styles.verificationSuccessText]}>
                  {verificationError}
                </Text>
              )}
            </View>
          )}
          
          <Text style={styles.formLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="password-input"
          />
          
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>
              By completing signup, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, !isEmailVerified && styles.disabledButton]}
            onPress={handleCompleteSignup}
            disabled={isLoading || !email || !password || !name || !isEmailVerified}
            testID="complete-signup-button"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Complete Signup</Text>
            )}
          </TouchableOpacity>
          
          {!isEmailVerified && isEmailSent && (
            <Text style={styles.verificationRequiredText}>
              Please verify your email to complete signup
            </Text>
          )}
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
    padding: 20,
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
    padding: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: typography.fontSizes.sectionHeading,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.primaryText,
  },
  subtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  formLabel: {
    fontSize: typography.fontSizes.formLabel,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.primaryText,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: typography.fontSizes.body,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emailInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  verifyEmailButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  verifyEmailButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.button,
    fontWeight: '600',
  },
  verifiedButton: {
    backgroundColor: colors.success,
  },
  verificationCodeContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: typography.fontSizes.body,
  },
  verifyCodeButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  verifiedCodeButton: {
    backgroundColor: colors.success,
  },
  verifyCodeButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.smallNote,
    fontWeight: '600',
  },
  verificationMessage: {
    marginTop: 8,
    fontSize: typography.fontSizes.smallNote,
  },
  verificationCodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationCodeInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: typography.fontSizes.body,
  },
  resendCodeButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  resendCodeButtonText: {
    color: colors.accent,
    fontSize: typography.fontSizes.smallNote,
    fontWeight: '500',
  },
  verificationErrorText: {
    marginTop: 8,
    fontSize: typography.fontSizes.smallNote,
    color: colors.error,
  },
  verificationSuccessText: {
    color: colors.success,
  },
  privacyContainer: {
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  privacyText: {
    fontSize: typography.fontSizes.smallNote,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    fontSize: typography.fontSizes.smallNote,
  },
  submitButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.neutralBorders,
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.button,
    fontWeight: '600',
  },
  resendButton: {
    padding: 8,
    alignSelf: 'center',
  },
  resendButtonText: {
    fontSize: typography.fontSizes.smallNote,
    color: colors.accent,
    fontWeight: '600',
  },
  verificationRequiredText: {
    color: colors.accent,
    fontSize: typography.fontSizes.smallNote,
    marginTop: 8,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: typography.fontSizes.smallNote,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  verificationEmail: {
    fontWeight: 'bold',
  },
  // Additional styles for custom amount
  customAmountLabel: {
    fontSize: typography.fontSizes.formLabel,
    color: colors.primaryText,
    marginBottom: 8,
    fontWeight: '500',
  },
  // Styles for address fields layout
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
});

// No default export - we're using named export at the top of the file
