import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { colors, typography } from '../../constants/theme';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Welcome screen component that matches the mockup UI
 */
export const WelcomeScreen = () => {
  // Use navigation with proper type
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

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

  // Handle navigation to login with proper error handling
  const handleNavigateToLogin = () => {
    try {
      navigation.navigate('Login');
    } catch (error) {
      console.error('Navigation error:', error);
      // Following iOS Development Guidelines - log meaningful error messages
      if (error instanceof Error) {
        console.error(`Failed to navigate to Login: ${error.message}`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome logo - since it already contains "The Assist App" text */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/welcome-logo.png')} 
            style={styles.logo} 
          />
        </View>
        
        {/* Tagline below the logo */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Show the need, We'll handle the help</Text>
        </View>

        {/* Main buttons - positioned absolutely for precise control */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={handleNavigateToSignup}
            testID="signup-button"
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleNavigateToLogin}
            testID="login-button"
          >
            <Text style={styles.loginButtonText}>Log In</Text>
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
  content: {
    flex: 1,
    justifyContent: 'space-between', // Distribute space between elements
    paddingTop: '20%', // Push logo/tagline down
    paddingBottom: '10%', // Push buttons up
    alignItems: 'center',
    paddingHorizontal: '5.6%', // Based on golden ratio
  },
  titleContainer: {
    width: '100%',
    paddingHorizontal: '8%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 40,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: 56,
    color: colors.black,
    lineHeight: 64,
    marginBottom: 4,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5, // Tighter letter spacing for bolder appearance
  },
  titleFirst: {
    marginBottom: 0, // Remove margin for the first title line
  },
  tagline: {
    fontFamily: typography.fonts.medium,
    fontSize: 17, // Apple's standard text size
    color: colors.secondaryText,
    letterSpacing: -0.08, // Apple's typical letter spacing
    textAlign: 'center',
    lineHeight: 22, // Apple's standard line height
    maxWidth: '61.8%', // Golden ratio
  },
  buttonContainer: {
    width: '88.8%', // Based on golden ratio (1 - 2*0.056 = 0.888)
    zIndex: 10, // Higher z-index to ensure buttons appear above all other elements
    alignSelf: 'center', // Center the container horizontally
    marginTop: 'auto', // Push to the bottom of available space
    marginBottom: '5.6%', // Consistent with horizontal padding
  },
  signUpButton: {
    backgroundColor: colors.black,
    borderRadius: 14, // Apple's typical button radius
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center', // Ensure content is centered vertically
    marginBottom: 12,
    elevation: 0, // Apple buttons typically don't have shadows
    width: '100%', // Full width of container
  },
  signUpButtonText: {
    fontFamily: typography.fonts.bold, // Using available bold font
    fontSize: 17, // Apple's standard button text size
    color: colors.white,
    letterSpacing: -0.41, // Apple's button text letter spacing
    textAlign: 'center', // Ensuring text is centered
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 14, // Apple's typical button radius
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center', // Ensure content is centered vertically
    borderWidth: 1,
    borderColor: colors.black,
    width: '100%', // Full width of container
  },
  loginButtonText: {
    fontFamily: typography.fonts.bold, // Using available bold font
    fontSize: 17, // Apple's standard button text size
    color: colors.black,
    letterSpacing: -0.41, // Apple's button text letter spacing
    textAlign: 'center', // Ensuring text is centered
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '3.4%', // Golden ratio-based spacing
    width: '100%',
  },
  logo: {
    width: 160,
    height: 200,
    resizeMode: 'contain',
  },
  taglineContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: '8.2%', // Slightly increased spacing for better balance
  },
});
