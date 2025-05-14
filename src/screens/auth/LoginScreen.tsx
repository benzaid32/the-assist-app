import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { colors, typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Welcome screen component that matches the mockup UI
 */
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen = () => {
  // Use navigation with simplified type
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  // State for form inputs and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Handle navigation to forgot password screen
  const handleNavigateToForgotPassword = () => {
    try {
      navigation.navigate('ForgotPassword');
    } catch (error) {
      console.error('Navigation error:', error);
      if (error instanceof Error) {
        console.error(`Failed to navigate to ForgotPassword: ${error.message}`);
      }
    }
  };

  // Get auth context
  const { login } = useAuth();
  
  // Validate form inputs
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }
    
    if (!password) {
      setErrorMessage('Password is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  // Handle login with proper error handling
  const handleLogin = async () => {
    try {
      setErrorMessage(null);
      
      // Validate form inputs
      if (!validateForm()) {
        return;
      }
      
      setIsLoading(true);
      
      // Use the actual user input for authentication
      await login({
        email: email.trim(),
        password: password
      });
      
      // The login function in AuthContext will update the user state
      // and trigger navigation to the app screens via the RootNavigator
    } catch (error) {
      console.error('Login error:', error);
      // Following iOS Development Guidelines - log meaningful error messages
      if (error instanceof Error) {
        setErrorMessage(error.message);
        console.error(`Failed to login: ${error.message}`);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Log In</Text>
              <Text style={styles.taglineText}>Helping real people. In real time</Text>
            </View>

            {/* Login form */}
            <View style={styles.formContainer}>
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                testID="email-input"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.secondaryText}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                testID="password-input"
              />
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
                testID="login-button"
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </TouchableOpacity>
              
              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>
              
              {/* Sign in with Google button */}
              <TouchableOpacity 
                style={styles.googleButton}
                testID="google-signin-button"
              >
                <View style={styles.googleButtonContent}>
                  <Image 
                    source={require('../../assets/images/icons8-gmail-250.png')} 
                    style={styles.googleIcon} 
                    resizeMode="contain"
                  />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity 
                  onPress={handleNavigateToForgotPassword}
                  testID="forgot-password-button"
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'center', // Center vertically
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    paddingHorizontal: '5.6%',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center', // Center horizontally
    marginBottom: 40,
  },
  headerText: {
    fontFamily: typography.fonts.bold,
    fontSize: 36, // Bigger font size
    color: colors.black,
    letterSpacing: -0.5,
    fontWeight: '900', // Bolder
  },
  taglineText: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.secondaryText,
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.black,
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: typography.fonts.medium,
  },
  loginButton: {
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  loginButtonText: {
    fontFamily: typography.fonts.bold,
    fontSize: 17,
    color: colors.white,
    letterSpacing: -0.41,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutralBorders,
  },
  dividerText: {
    paddingHorizontal: 10,
    color: colors.secondaryText,
    fontSize: 14,
    fontFamily: typography.fonts.regular,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    overflow: 'hidden',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 17, // Match the font size of the button text
    height: 17, // Match the font size of the button text
    marginRight: 10,
  },
  googleButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 17,
    color: colors.black,
    letterSpacing: -0.41,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: 14,
    fontFamily: typography.fonts.medium,
  },
});

export default LoginScreen;
