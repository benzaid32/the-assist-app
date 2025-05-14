import React, { useEffect } from 'react';
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
import { FormInput } from '../../components/auth/FormInput';
import { Button } from '../../components/auth/Button';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, LoginFormData } from '../../lib/validation/auth';
import { useForm } from '../../hooks/useForm';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * Login screen component with form validation
 * Uses custom form hook for state management
 */
// Define local type for navigation
type LoginScreenNavigationProp = NativeStackNavigationProp<{
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
}>;

export const LoginScreen = () => {
  // Use navigation with simplified type
  const navigation = useNavigation<LoginScreenNavigationProp>();
  // Auth context
  const { login, isLoading, error, clearError } = useAuth();

  // Initialize form with custom hook
  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit, 
    resetForm 
  } = useForm<LoginFormData, typeof loginSchema>(
    loginSchema, 
    { email: '', password: '' }
  );

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [clearError, error]);

  // Handle login submission
  const handleLogin = async () => {
    Keyboard.dismiss();
    
    await handleSubmit(async (formData) => {
      try {
        clearError();
        await login(formData);
        // Navigation will be handled by the auth state change in AuthContext
      } catch (error) {
        // Error is already handled in AuthContext and displayed below
        console.error('Login failed:', error);
      }
    });
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // Use try/catch for navigation operations for more robust error handling
    try {
      navigation.navigate('ForgotPassword');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Handle navigation to signup
  const handleNavigateToSignup = () => {
    try {
      navigation.navigate('Signup');
    } catch (error) {
      console.error('Navigation error:', error);
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
                label="Email"
                value={values.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                testID="login-email"
              />

              <FormInput
                label="Password"
                value={values.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
                testID="login-password"
              />

              <TouchableOpacity 
                onPress={handleForgotPassword}
                style={styles.forgotPasswordContainer}
                testID="forgot-password-button"
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={!values.email || !values.password}
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
    backgroundColor: '#FFFFFF',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  globalError: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 16,
    color: '#666666',
  },
  signupLinkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
