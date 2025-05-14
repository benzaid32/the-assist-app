import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;

/**
 * Email Verification Screen
 * Displays instructions for email verification and allows resending verification emails
 */
export const VerifyEmailScreen = () => {
  const navigation = useNavigation<VerifyEmailScreenNavigationProp>();
  const route = useRoute<VerifyEmailScreenRouteProp>();
  const { email } = route.params;
  
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle back button press
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      // In a real app, we would call a function to resend the verification email
      // For now, we'll just simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000); // Reset success message after 5 seconds
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to resend verification email');
      }
    } finally {
      setIsResending(false);
    }
  };

  // Handle continue to login
  const handleContinueToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="mail" size={64} color={colors.black} style={styles.icon} />
        
        <Text style={styles.title}>Verify Your Email</Text>
        
        <Text style={styles.description}>
          We've sent a verification email to:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <Text style={styles.instructions}>
          Please check your inbox and click the verification link to complete your signup.
        </Text>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {resendSuccess && (
          <Text style={styles.successText}>Verification email resent successfully!</Text>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={handleResendVerification} 
            style={[styles.button, styles.resendButton, isResending && styles.buttonDisabled]}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator color={colors.black} size="small" />
            ) : (
              <Text style={styles.resendButtonText}>Resend Verification Email</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleContinueToLogin} 
            style={[styles.button, styles.continueButton]}
          >
            <Text style={styles.continueButtonText}>Continue to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: 28,
    color: colors.black,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontFamily: typography.fonts.bold,
    fontSize: 16,
    color: colors.black,
    marginBottom: 24,
    textAlign: 'center',
  },
  instructions: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 40,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resendButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
  },
  continueButton: {
    backgroundColor: colors.black,
  },
  resendButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.black,
  },
  continueButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: 'green',
    marginBottom: 16,
    textAlign: 'center',
  },
});
