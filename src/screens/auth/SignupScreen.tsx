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
import { signupSchema } from '../../lib/validation/auth';
import { UserType } from '../../types/auth';
import { useForm } from '../../hooks/useForm';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  Dashboard: undefined;
}>;

export const SignupScreen = () => {
  // Use navigation with simplified type
  const navigation = useNavigation<SignupScreenNavigationProp>();
  // Auth context
  const { signup, isLoading, error, clearError } = useAuth();

  // Initialize form with custom hook
  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit,
    resetForm 
  } = useForm<SignupFormData, typeof signupSchema>(
    signupSchema, 
    { 
      email: '', 
      password: '', 
      confirmPassword: '', 
      userType: '' as UserType | '' 
    }
  );

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [clearError, error]);

  // Handle signup submission
  const handleSignup = async () => {
    Keyboard.dismiss();
    
    await handleSubmit(async (formData) => {
      try {
        clearError();
        if (!formData.userType) {
          throw new Error('Please select a user type');
        }
        
        await signup({ 
          email: formData.email, 
          password: formData.password, 
          userType: formData.userType as UserType 
        });
        // Navigation will be handled by the auth state change in AuthContext
      } catch (error) {
        // Error is already handled in AuthContext and displayed below
        console.error('Signup failed:', error);
      }
    });
  };

  // Set user type
  const setUserType = (type: UserType) => {
    handleChange('userType', type);
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
                label="Email"
                value={values.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                testID="signup-email"
              />

              <FormInput
                label="Password"
                value={values.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Create a password"
                secureTextEntry
                error={errors.password}
                testID="signup-password"
              />

              <FormInput
                label="Confirm Password"
                value={values.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                placeholder="Confirm your password"
                secureTextEntry
                error={errors.confirmPassword}
                testID="signup-confirm-password"
              />

              <View style={styles.userTypeContainer}>
                <Text style={styles.userTypeLabel}>I am signing up as a:</Text>
                
                <RadioButton
                  selected={values.userType === UserType.SUBSCRIBER}
                  onSelect={() => setUserType(UserType.SUBSCRIBER)}
                  label="Subscriber (Donor)"
                  testID="signup-subscriber-radio"
                />
                
                <RadioButton
                  selected={values.userType === UserType.APPLICANT}
                  onSelect={() => setUserType(UserType.APPLICANT)}
                  label="Applicant (Need Assistance)"
                  testID="signup-applicant-radio"
                />

                {errors.userType && (
                  <Text style={styles.errorText}>{errors.userType}</Text>
                )}
              </View>

              <Button
                title="Create Account"
                onPress={handleSignup}
                isLoading={isLoading}
                disabled={
                  !values.email || 
                  !values.password || 
                  !values.confirmPassword || 
                  !values.userType
                }
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
    backgroundColor: '#FFFFFF',
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
  signupButton: {
    marginTop: 24,
  },
  userTypeContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
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
    borderColor: '#999999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#666666',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
