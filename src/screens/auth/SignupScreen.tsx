import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Keyboard,
  TextInput
} from 'react-native';
import { FormInput, FormInputHandle } from '../../components/auth/FormInput';
import { Button } from '../../components/auth/Button';
import { useAuth } from '../../contexts/AuthContext';
import { signupSchema } from '../../lib/validation/auth';
import { UserType } from '../../types/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, globalStyles } from '../../constants/theme';

type SignupFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType | '';
};

/**
 * Radio button component for user type selection
 */
const RadioButton = ({
  selected,
  onSelect,
  label,
  testID
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  testID?: string;
}) => (
  <TouchableOpacity 
    style={styles.radioContainer} 
    onPress={onSelect}
    testID={testID}
  >
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

/**
 * Signup screen component with form validation
 * Uses custom form hook for state management
 */
// Define local type for navigation
type SignupScreenNavigationProp = NativeStackNavigationProp<{
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  AppTabs: undefined; // Updated to match the new navigation structure
}>;

export const SignupScreen = () => {
  // Navigation handler
  const navigation = useNavigation<SignupScreenNavigationProp>();
  
  // Auth context
  const { signup, isLoading, error, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType | ''>('');
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Input refs for keyboard navigation
  const emailInputRef = useRef<FormInputHandle>(null);
  const passwordInputRef = useRef<FormInputHandle>(null);
  const confirmPasswordInputRef = useRef<FormInputHandle>(null);

  // Clear errors when field is changed
  const handleFieldChange = (field: string, value: string) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }

    // Update the appropriate state
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
  };

  // Handle user type selection
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (formErrors.userType) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.userType;
        return newErrors;
      });
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // User type validation
    if (!userType) {
      newErrors.userType = 'Please select a user type';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle signup submission
  const handleSignup = async () => {
    Keyboard.dismiss();
    clearError();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await signup({ 
        email, 
        password, 
        userType: userType as UserType 
      });
      // Navigation handled by auth state change in AuthContext
    } catch (error) {
      console.error('Signup failed:', error);
      // Error already handled in AuthContext
    }
  };

  // Handle navigation to login
  const handleNavigateToLogin = () => {
    try {
      navigation.navigate('Login');
    } catch (error) {
      console.error('Navigation error:', error);
      // Following iOS Development Guidelines - log meaningful error messages
      if (error instanceof Error) {
        console.error(`Failed to navigate: ${error.message}`);
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
          testID="signup-screen"
        >
          <View style={styles.content}>
            <Text style={styles.title}>The Assist App</Text>
            <Text style={styles.subtitle}>Create your account</Text>

            {/* Display global error from auth context */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.globalError}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              <FormInput
                ref={emailInputRef}
                name="email"
                label="Email"
                value={email}
                onChangeText={(text) => handleFieldChange('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={formErrors.email}
                testID="signup-email"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                autoFocus={true} // Auto-focus on first field for better UX
              />

              <FormInput
                ref={passwordInputRef}
                name="password"
                label="Password"
                value={password}
                onChangeText={(text) => handleFieldChange('password', text)}
                placeholder="Create a password"
                secureTextEntry
                error={formErrors.password}
                testID="signup-password"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />

              <FormInput
                ref={confirmPasswordInputRef}
                name="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => handleFieldChange('confirmPassword', text)}
                placeholder="Confirm your password"
                secureTextEntry
                error={formErrors.confirmPassword}
                testID="signup-confirm-password"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />

              <View style={styles.userTypeContainer}>
                <Text style={styles.userTypeLabel}>I am signing up as a:</Text>
                
                <RadioButton
                  selected={userType === UserType.SUBSCRIBER}
                  onSelect={() => handleUserTypeSelect(UserType.SUBSCRIBER)}
                  label="Subscriber (Donor)"
                  testID="signup-subscriber-radio"
                />
                
                <RadioButton
                  selected={userType === UserType.APPLICANT}
                  onSelect={() => handleUserTypeSelect(UserType.APPLICANT)}
                  label="Applicant (Need Assistance)"
                  testID="signup-applicant-radio"
                />

                {formErrors.userType && (
                  <Text style={styles.errorText}>{formErrors.userType}</Text>
                )}
              </View>

              <Button
                title="Create Account"
                onPress={handleSignup}
                isLoading={isLoading}
                disabled={!email || !password || !confirmPassword || !userType}
                style={styles.signupButton}
                testID="signup-button"
              />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity 
                onPress={handleNavigateToLogin}
                testID="navigate-login-button"
              >
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.accent,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 32,
    textAlign: 'center',
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
  signupButton: {
    marginTop: 24,
  },
  userTypeContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  userTypeLabel: {
    fontSize: typography.fontSizes.body,
    fontFamily: typography.fonts.medium,
    marginBottom: 12,
    color: colors.primaryText,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutralBorders,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  radioLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    marginLeft: 12,
    color: colors.primaryText,
  },
  errorText: {
    color: colors.accent,
    fontSize: typography.fontSizes.label,
    marginTop: 4,
    fontFamily: typography.fonts.regular,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  loginLinkText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.accent,
    marginLeft: 8,
  },
});
