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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography } from '../../constants/theme';
import { UserType } from '../../types/auth';

// Import the RootStackParamList from App.tsx for proper navigation typing
import { RootStackParamList } from '../../../App';

// Define the navigation prop type for this screen
type ApplicantOnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApplicantOnboarding'>;

/**
 * Applicant Onboarding Screen
 * Collects applicant information and completes the signup process
 * Following enterprise-grade development guidelines with proper error handling
 */
export const ApplicantOnboardingScreen = () => {
  const navigation = useNavigation<ApplicantOnboardingScreenNavigationProp>();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [assistanceType, setAssistanceType] = useState<'rent' | 'utilities' | 'tuition' | ''>('');

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

  // Handle form submission
  const handleSubmit = async () => {
    if (!email || !password || !name || !assistanceType) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Sign up the user with proper type safety
      await signup({
        email,
        password,
        userType: UserType.APPLICANT,
        // Store additional user data in a separate call or extend the auth context
        // to handle these additional fields
      });
      
      // Note: In a production app, we would store the additional user data
      // (name and assistance type) in a separate Firestore document
      console.log('Additional user data to store:', {
        name,
        assistanceType
      });

      // Navigation will happen automatically via the AuthContext
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
          <Text style={styles.title}>Applicant Details</Text>
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
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="email-input"
          />

          <Text style={styles.formLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="password-input"
          />

          <Text style={styles.formLabel}>Assistance Type</Text>
          <View style={styles.assistanceContainer}>
            <TouchableOpacity 
              style={[styles.assistanceOption, assistanceType === 'rent' && styles.assistanceOptionSelected]}
              onPress={() => setAssistanceType('rent')}
              testID="assistance-rent"
            >
              <Ionicons 
                name="home-outline" 
                size={24} 
                color={assistanceType === 'rent' ? colors.white : colors.primaryText} 
              />
              <Text style={[styles.assistanceText, assistanceType === 'rent' && styles.assistanceTextSelected]}>
                Rent
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.assistanceOption, assistanceType === 'utilities' && styles.assistanceOptionSelected]}
              onPress={() => setAssistanceType('utilities')}
              testID="assistance-utilities"
            >
              <Ionicons 
                name="flash-outline" 
                size={24} 
                color={assistanceType === 'utilities' ? colors.white : colors.primaryText} 
              />
              <Text style={[styles.assistanceText, assistanceType === 'utilities' && styles.assistanceTextSelected]}>
                Utilities
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.assistanceOption, assistanceType === 'tuition' && styles.assistanceOptionSelected]}
              onPress={() => setAssistanceType('tuition')}
              testID="assistance-tuition"
            >
              <Ionicons 
                name="school-outline" 
                size={24} 
                color={assistanceType === 'tuition' ? colors.white : colors.primaryText} 
              />
              <Text style={[styles.assistanceText, assistanceType === 'tuition' && styles.assistanceTextSelected]}>
                Tuition
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
            testID="submit-button"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Continue to Documents</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressIndicator}>
          <View style={[styles.progressDot, styles.progressDotInactive]} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
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
    padding: 24,
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
    padding: 8,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: 42, // Larger size like other screens
    color: colors.black,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold', // Maximum boldness
  },
  subtitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  formLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.formLabel,
    color: colors.primaryText,
    marginBottom: 8,
    alignSelf: 'flex-start',
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    borderRadius: 12, // More modern rounded corners
    paddingHorizontal: 16,
    paddingVertical: 14, // Slightly taller for better touch targets
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    marginBottom: 20, // More spacing between inputs
    width: '100%', // Full width
    color: colors.black,
  },
  assistanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
  },
  assistanceOption: {
    width: '48%',
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  assistanceOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  assistanceText: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    letterSpacing: -0.2,
  },
  assistanceTextSelected: {
    color: colors.white,
  },
  errorText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 17,
    color: colors.white,
    letterSpacing: -0.41,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.black,
    marginHorizontal: 4,
  },
  progressDotInactive: {
    backgroundColor: colors.neutralBorders,
  },
});

export default ApplicantOnboardingScreen;
