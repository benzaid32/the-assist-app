import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  AccessibilityInfo
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '../../constants/theme';
import { RootStackParamList } from '../../../App';

// Screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

/**
 * Role selection card component with enhanced visual feedback
 */
type RoleOptionProps = {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description: string;
  icon: string;
  isPrimary?: boolean;
  testID?: string;
};

const RoleOption = ({
  selected,
  onSelect,
  label,
  description,
  icon,
  isPrimary = false,
  testID
}: RoleOptionProps) => (
  <TouchableOpacity 
    style={[
      styles.roleOption, 
      selected && styles.roleOptionSelected,
      isPrimary && styles.primaryRoleOption
    ]} 
    onPress={onSelect}
    testID={testID}
    accessible={true}
    accessibilityLabel={`Select ${label} role`}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityHint={`Tap to select ${label} role and see more options`}
  >
    <View style={styles.roleContent}>
      <View style={[styles.iconContainer, isPrimary && styles.primaryIconContainer]}>
        <Ionicons name={icon as any} size={28} color={selected ? colors.white : colors.black} />
      </View>
      <View style={styles.roleTextContainer}>
        <Text style={[
          styles.roleLabel, 
          selected && isPrimary && styles.selectedPrimaryRoleLabel
        ]}>
          {label}
        </Text>
        <Text style={[
          styles.roleDescription,
          selected && isPrimary && styles.selectedPrimaryRoleDescription
        ]}>
          {description}
        </Text>
      </View>
    </View>
    {selected && (
      <View style={styles.checkmarkContainer}>
        <Ionicons 
          name="checkmark-circle" 
          size={24} 
          color={isPrimary ? colors.white : colors.black} 
        />
      </View>
    )}
  </TouchableOpacity>
);

/**
 * Enhanced signup screen with improved UX for role selection
 */
type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export const EnhancedSignupScreen = () => {
  // Navigation handler
  const navigation = useNavigation<SignupScreenNavigationProp>();
  
  // Role selection state
  const [userType, setUserType] = useState<UserType | ''>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error on screen focus
  useFocusEffect(
    useCallback(() => {
      setError(null);
      
      // Announce screen for accessibility
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility("Sign up screen. Please select your role.");
      }
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );

  // Handle user type selection
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setError(null); // Clear any previous errors when changing selection
  };

  // Handle back button press
  const handleBack = () => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation error:', error);
      // Following iOS Development Guidelines - log meaningful error messages
      if (error instanceof Error) {
        console.error(`Failed to navigate back: ${error.message}`);
      }
    }
  };

  // Handle next button press to proceed to the next step of onboarding
  const handleNext = async () => {
    if (!userType || isLoading) return; // Prevent proceeding without selection or while loading
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Navigate to the appropriate onboarding flow based on user type
      if (userType === UserType.SUBSCRIBER) {
        navigation.navigate('SubscriberOnboarding');
      } else if (userType === UserType.APPLICANT) {
        navigation.navigate('ApplicantOnboarding');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Detailed error logging for enterprise-grade error handling
      if (error instanceof Error) {
        const errorMessage = `Failed to navigate: ${error.message}`;
        console.error(errorMessage);
        setError('Unable to proceed to the next step. Please try again.');
        
        // Analytics tracking would go here in production
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Back button with improved touch target */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              testID="back-button"
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              accessibilityHint="Tap to return to the previous screen"
            >
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </TouchableOpacity>

            {/* Header with enhanced typography */}
            <View style={styles.headerContainer}>
              <Text style={styles.title} accessibilityRole="header">Join The Assist App</Text>
              <Text style={styles.subtitle}>Create an account to get started</Text>
            </View>
            
            {/* Role selection with improved UI */}
            <View style={styles.roleSelectionContainer}>
              <Text style={styles.roleSelectionLabel}>How would you like to help?</Text>
              
              <RoleOption
                selected={userType === UserType.SUBSCRIBER}
                onSelect={() => handleUserTypeSelect(UserType.SUBSCRIBER)}
                label="Become a Subscriber"
                description="Make a difference with monthly micro-donations to those in need"
                icon="heart-circle-outline"
                isPrimary={true}
                testID="signup-subscriber-option"
              />
              
              <RoleOption
                selected={userType === UserType.APPLICANT}
                onSelect={() => handleUserTypeSelect(UserType.APPLICANT)}
                label="Apply for Assistance"
                description="Request help with essential bills like rent and utilities"
                icon="document-text-outline"
                testID="signup-applicant-option"
              />
            </View>

            {/* Error message display */}
            {error && (
              <View style={styles.errorContainer} accessibilityRole="alert">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Next button with loading state */}
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                !userType ? styles.nextButtonDisabled : null,
                userType === UserType.SUBSCRIBER ? styles.subscriberNextButton : null
              ]}
              onPress={handleNext}
              disabled={!userType || isLoading}
              testID="next-button"
              accessible={true}
              accessibilityLabel={isLoading ? "Loading" : "Continue to next step"}
              accessibilityRole="button"
              accessibilityState={{ disabled: !userType || isLoading }}
              accessibilityHint="Tap to continue with the selected role"
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.nextButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Enhanced progress indicator */}
            <View style={styles.progressIndicator}>
              <View style={styles.progressDot} />
              <View style={[styles.progressDot, styles.progressDotInactive]} />
              <View style={[styles.progressDot, styles.progressDotInactive]} />
            </View>

            {/* Privacy note */}
            <Text style={styles.privacyNote}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
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
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    padding: 10, // Increased padding for better touch target
    marginLeft: -10,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: 32,
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '900',
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.primaryText,
    textAlign: 'center',
    opacity: 0.8,
  },
  roleSelectionContainer: {
    marginBottom: 32,
  },
  roleSelectionLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: 18,
    color: colors.black,
    marginBottom: 16,
    textAlign: 'left',
    fontWeight: '600',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  primaryIconContainer: {
    backgroundColor: colors.black,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleOptionSelected: {
    borderColor: colors.black,
    borderWidth: 2,
  },
  primaryRoleOption: {
    backgroundColor: colors.black,
  },
  roleLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedPrimaryRoleLabel: {
    color: colors.white,
  },
  roleDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  selectedPrimaryRoleDescription: {
    color: colors.white,
    opacity: 0.9,
  },
  checkmarkContainer: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  errorText: {
    color: '#D32F2F',
    fontFamily: typography.fonts.medium,
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
    width: '100%',
  },
  subscriberNextButton: {
    backgroundColor: '#0A84FF', // Blue color for subscriber path
  },
  nextButtonDisabled: {
    backgroundColor: colors.neutralBorders,
  },
  nextButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    fontWeight: '600',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  privacyNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.secondaryText,
    fontFamily: typography.fonts.regular,
  }
});

export const SignupScreen = EnhancedSignupScreen;
