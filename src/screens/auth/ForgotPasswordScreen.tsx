import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import { z } from 'zod';
import { FormInput } from '../../components/auth/FormInput';
import { Button } from '../../components/auth/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, globalStyles } from '../../constants/theme';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password screen component
 * Uses custom form hook for state management
 */
// Define local type for navigation
type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<{
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  AppTabs: undefined; // Updated to match the new navigation structure
}>;

export const ForgotPasswordScreen = () => {
  // Use navigation with simplified type
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  // Local UI state
  const [resetSent, setResetSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  
  // Auth context
  const { sendPasswordReset, isLoading, error, clearError } = useAuth();
  
  // Initialize form with custom hook
  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit,
    resetForm 
  } = useForm<ForgotPasswordFormData, typeof forgotPasswordSchema>(
    forgotPasswordSchema, 
    { email: '' }
  );

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [clearError, error]);

  // Handle reset password
  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    await handleSubmit(async (formData) => {
      try {
        clearError();
        await sendPasswordReset(formData.email);
        setSentToEmail(formData.email);
        setResetSent(true);
      } catch (error) {
        console.error('Password reset failed:', error);
        // Error is already handled in AuthContext
      }
    });
  };

  // Handle navigation to login
  const handleGoBack = () => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation error:', error);
      // Following iOS Development Guidelines - ensure errors are handled properly
      if (error instanceof Error) {
        console.error(`Failed to navigate back: ${error.message}`);
        // Fallback navigation if goBack fails
        try {
          navigation.navigate('Login');
        } catch (fallbackError) {
          console.error('Fallback navigation also failed:', fallbackError);
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          testID="forgot-password-screen"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Forgot Password</Text>
            
            {resetSent ? (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>Email Sent</Text>
                <Text style={styles.successText}>
                  If an account exists with {sentToEmail}, you'll receive a password reset link shortly.
                </Text>
                <Button
                  title="Return to Login"
                  onPress={handleGoBack}
                  style={styles.returnButton}
                  testID="return-login-button"
                />
              </View>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                {/* Display global error from auth context */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.globalError}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.formContainer}>
                  <FormInput
                    label="Email"
                    value={values.email}
                    onChangeText={(text) => handleChange('email', text)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    testID="forgot-password-email"
                  />

                  <Button
                    title="Send Reset Link"
                    onPress={handleResetPassword}
                    isLoading={isLoading}
                    disabled={!values.email}
                    style={styles.resetButton}
                    testID="reset-password-button"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={handleGoBack}
                  testID="back-button"
                >
                  <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.primaryText,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEEEE', // Light red background for errors
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  globalError: {
    color: colors.accent,
    fontSize: typography.fontSizes.label,
    fontFamily: typography.fonts.medium,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 24,
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    fontSize: typography.fontSizes.body,
    color: colors.accent,
    fontFamily: typography.fonts.medium,
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: '#34C759', // Success green color, could add to theme if used elsewhere
    marginBottom: 16,
  },
  successText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  returnButton: {
    marginTop: 16,
  },
});
