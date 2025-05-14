import React, { useState, useRef, useEffect } from 'react';
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
import { FormInput, FormInputHandle } from '../../components/auth/FormInput';
import { Button } from '../../components/auth/Button';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail } from '../../lib/form/validation';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, globalStyles } from '../../constants/theme';

/**
 * Login screen component with enterprise-grade form validation
 */
type LoginScreenNavigationProp = NativeStackNavigationProp<{
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  AppTabs: undefined; // Updated to match the new navigation structure
}>;

export const LoginScreen = () => {
  // Use navigation with simplified type
  const navigation = useNavigation<LoginScreenNavigationProp>();
  // Auth context
  const { login, isLoading, error, clearError } = useAuth();

  // Form state using direct state management for better performance
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Create refs for form fields to enable keyboard navigation
  const emailInputRef = useRef<FormInputHandle>(null);
  const passwordInputRef = useRef<FormInputHandle>(null);

  // Clear errors when field is changed - prevents error messages during typing
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
    }
    
    // Clear any auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission with proper validation
  const handleLogin = async () => {
    Keyboard.dismiss();
    clearError();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      await login({ email, password });
      // Navigation will be handled by the auth state change in AuthContext
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Login failed:', error);
    }
  };

  // Handle forgot password
  const handleNavigateToForgotPassword = () => {
    try {
      navigation.navigate('ForgotPassword');
    } catch (error) {
      console.error('Navigation error:', error);
      // Following iOS Development Guidelines - log meaningful error messages
      if (error instanceof Error) {
        console.error(`Failed to navigate to ForgotPassword: ${error.message}`);
      }
    }
  };

  // Handle navigation to signup with proper error handling
  const handleNavigateToSignup = () => {
    try {
      navigation.navigate('Signup');
    } catch (error) {
      console.error('Navigation error:', error);
      // Following iOS Development Guidelines - log meaningful error messages
      if (error instanceof Error) {
        console.error(`Failed to navigate to Signup: ${error.message}`);
      }
    }
  };

  // Clear auth errors when component unmounts - follows React best practices
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [clearError, error]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          testID="login-screen"
        >
          <View style={styles.content}>
            <Text style={styles.title}>The Assist App</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

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
                testID="login-email"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                autoFocus={true}
              />

              <FormInput
                ref={passwordInputRef}
                name="password"
                label="Password"
                value={password}
                onChangeText={(text) => handleFieldChange('password', text)}
                placeholder="Enter your password"
                secureTextEntry
                error={formErrors.password}
                testID="login-password"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => handleLogin()}
              />

              <TouchableOpacity 
                onPressOut={handleNavigateToForgotPassword}
                style={styles.forgotPasswordContainer}
                testID="forgot-password-button"
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={!email || !password}
                style={styles.loginButton}
                testID="login-button"
              />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity 
                onPress={handleNavigateToSignup}
                testID="navigate-signup-button"
              >
                <Text style={styles.signupLinkText}>Sign Up</Text>
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
    color: colors.accent, // Using accent color from theme
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
    borderColor: colors.accent, // Using accent for error border
  },
  globalError: {
    color: colors.accent, // Using accent color for errors
    fontSize: typography.fontSizes.label,
    fontFamily: typography.fonts.medium,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 24,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: typography.fontSizes.label,
    color: colors.accent,
    fontFamily: typography.fonts.medium,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  signupLinkText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.accent,
    marginLeft: 8,
  },
});
