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

// Import PreAuthService for enterprise-grade authentication flow
import { PreAuthService } from '../../services/api/preAuthService';

// Import the RootStackParamList from App.tsx for proper navigation typing
import { RootStackParamList } from '../../../App';

// Define the navigation prop type for this screen
type SubscriberOnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SubscriberOnboarding'>;

/**
 * Subscriber Onboarding Screen
 * Collects subscriber information and completes the signup process
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
  const [subscriptionAmount, setSubscriptionAmount] = useState('10');
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  
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

  // Complete signup after email verification by creating the user account
  const handleCompleteSignup = async () => {
    if (!email || !password || !name || !isEmailVerified || !verificationId) {
      setError('Please fill in all required fields and verify your email');
      return;
    }

    // Validate custom amount if selected
    if (isCustomAmount) {
      if (!customAmount) {
        setError('Please enter a custom amount');
        return;
      }
      
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Determine the final amount to use
      const finalAmount = isCustomAmount 
        ? parseFloat(customAmount) 
        : parseInt(subscriptionAmount, 10);
      
      // Create the user with additional subscriber data
      const userData = {
        name,
        subscriptionAmount: finalAmount
      };
      
      // For now we have to implement this part manually since
      // our PreAuthService's createVerifiedUser method isn't fully functional yet
      
      // We'll create a manual implementation following enterprise standards
      // Get Firebase Auth and Firestore instances
      const auth = firebase.auth();
      const db = firebase.firestore();
      
      // 1. Get the verified email from the verification record
      const verificationRef = db.collection('preVerificationCodes').doc(verificationId);
      const verificationDoc = await verificationRef.get();
      
      if (!verificationDoc.exists) {
        throw new Error('Verification record not found. Please restart the signup process.');
      }
      
      const verificationData = verificationDoc.data();
      if (!verificationData || !verificationData.verified) {
        throw new Error('Email verification status is invalid. Please verify your email first.');
      }
      
      // 2. Create the Firebase Auth user
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      if (!userCredential.user) {
        throw new Error('Failed to create user account. Please try again.');
      }
      
      // 3. Create user documents in a transaction to ensure data consistency
      const userId = userCredential.user.uid;
      const batch = db.batch();
      
      // Create base user document
      const userRef = db.collection('users').doc(userId);
      batch.set(userRef, {
        email,
        userType: UserType.SUBSCRIBER,
        emailVerified: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        profileComplete: true,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        metadata: {
          createdBy: 'signup_process',
          updatedBy: 'signup_process',
          environment: process.env.NODE_ENV || 'development'
        }
      });
      
      // Create subscriber record
      const subscriberRef = db.collection('subscribers').doc(userId);
      batch.set(subscriberRef, {
        userId,
        name,
        subscriptionAmount: finalAmount,
        tier: finalAmount <= 5 ? 'basic' : finalAmount <= 15 ? 'standard' : 'premium',
        status: 'active',
        stripeId: null,
        startDate: firebase.firestore.FieldValue.serverTimestamp(),
        paymentHistory: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        metadata: {
          createdBy: 'signup_process',
          updatedBy: 'signup_process'
        }
      });
      
      // Delete the verification record to prevent reuse
      batch.delete(verificationRef);
      
      // Commit all changes atomically
      await batch.commit();
      
      // Log in the user after successful account creation
      await login({
        email,
        password
      });
      
      // Navigate to home screen after successful signup
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabs' }],
      });
      
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
          <Text style={styles.title}>Subscriber Details</Text>
          <Text style={styles.subtitle}>Complete your profile</Text>
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
                  <Text style={styles.verifyEmailButtonText}>Send Code</Text>
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
              <Text style={styles.verificationText}>
                Enter the 6-digit code sent to <Text style={styles.verificationEmail}>{email}</Text>
              </Text>
              
              <View style={styles.codeInputRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="6-digit code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  testID="verification-input"
                  editable={!isEmailVerified}
                />
                
                <TouchableOpacity 
                  style={[styles.verifyCodeButton, isEmailVerified && styles.verifiedCodeButton]}
                  onPress={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6 || isEmailVerified}
                  testID="verify-code-button"
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.verifyCodeButtonText}>
                      {isEmailVerified ? 'Verified' : 'Verify'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {!isEmailVerified && (
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleResendCode}
                  disabled={isLoading}
                  testID="resend-button"
                >
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                </TouchableOpacity>
              )}
              
              {verificationError && (
                <Text style={[styles.verificationMessage, 
                  verificationError.includes('success') ? styles.successText : 
                  verificationError.includes('sent') ? styles.infoText : styles.errorText]}>
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

          <Text style={styles.formLabel}>Monthly Contribution</Text>
          <View style={styles.amountContainer}>
            <TouchableOpacity 
              style={[styles.amountOption, subscriptionAmount === '1' && !isCustomAmount && styles.amountOptionSelected]}
              onPress={() => {
                setSubscriptionAmount('1');
                setIsCustomAmount(false);
              }}
              testID="amount-1"
            >
              <Text style={[styles.amountText, subscriptionAmount === '1' && !isCustomAmount && styles.amountTextSelected]}>$1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.amountOption, subscriptionAmount === '5' && !isCustomAmount && styles.amountOptionSelected]}
              onPress={() => {
                setSubscriptionAmount('5');
                setIsCustomAmount(false);
              }}
              testID="amount-5"
            >
              <Text style={[styles.amountText, subscriptionAmount === '5' && !isCustomAmount && styles.amountTextSelected]}>$5</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.amountOption, subscriptionAmount === '10' && !isCustomAmount && styles.amountOptionSelected]}
              onPress={() => {
                setSubscriptionAmount('10');
                setIsCustomAmount(false);
              }}
              testID="amount-10"
            >
              <Text style={[styles.amountText, subscriptionAmount === '10' && !isCustomAmount && styles.amountTextSelected]}>$10</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.amountOption, subscriptionAmount === '20' && !isCustomAmount && styles.amountOptionSelected]}
              onPress={() => {
                setSubscriptionAmount('20');
                setIsCustomAmount(false);
              }}
              testID="amount-20"
            >
              <Text style={[styles.amountText, subscriptionAmount === '20' && !isCustomAmount && styles.amountTextSelected]}>$20</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customAmountContainer}>
            <TouchableOpacity 
              style={[styles.customAmountToggle, isCustomAmount && styles.amountOptionSelected]}
              onPress={() => setIsCustomAmount(!isCustomAmount)}
              testID="custom-amount-toggle"
            >
              <Text style={[styles.amountText, isCustomAmount && styles.amountTextSelected]}>Custom</Text>
            </TouchableOpacity>
            
            {isCustomAmount && (
              <View style={styles.customAmountInputContainer}>
                <Text style={styles.customAmountPrefix}>$</Text>
                <TextInput
                  style={styles.customAmountInput}
                  placeholder="Enter amount"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="decimal-pad"
                  testID="custom-amount-input"
                />
              </View>
            )}
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
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  amountOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  amountText: {
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    fontWeight: '500',
  },
  amountTextSelected: {
    color: colors.white,
  },
  customAmountContainer: {
    marginBottom: 16,
  },
  customAmountToggle: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  customAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  customAmountPrefix: {
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginRight: 4,
  },
  customAmountInput: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    fontSize: typography.fontSizes.smallNote,
  },
  successText: {
    color: colors.success,
  },
  infoText: {
    color: colors.info,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: colors.secondaryText,
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
    fontSize: typography.fontSizes.smallNote,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
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
  }
});

export default SubscriberOnboardingScreen;
