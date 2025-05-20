import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import firebase from 'firebase/compat/app';
import { NavigationProp } from '@react-navigation/native';
import { colors, typography } from '../../../../constants/theme';
import { ProfileData } from '../../../../services/api/profileService';

// Define a simplified app navigation type
type AppNavigation = {
  SupportInfo: undefined;
  [key: string]: object | undefined;
};

type SubscriptionCardProps = {
  subscriptionDetails: NonNullable<ProfileData['subscriptionDetails']>;
  navigation: NavigationProp<AppNavigation>;
};

/**
 * SubscriptionCard component for displaying subscription details
 * Used in subscriber settings screen
 */
const SubscriptionCard = ({ subscriptionDetails, navigation }: SubscriptionCardProps) => {
  const handleManageSubscription = () => {
    try {
      // Navigate to subscription management screen
      navigation.navigate('SubscriptionManagement');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };
  
  /**
   * Handle navigation to support info screen or web upgrade page
   * This follows App Store guidelines by only showing information about
   * subscription options without direct payment links
   */
  const handleViewSupportOptions = () => {
    try {
      // For free users, we want to open the web subscription page
      if (subscriptionDetails.tier === 'Free') {
        // Get Firebase Auth current user to pass userId
        const auth = firebase.auth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Open web browser to subscription page with userId parameter for tracking
          // and upgrade=true to indicate this is an upgrade from free tier
          const webSubscriptionUrl = `https://assist-app-web.vercel.app/subscribe?userId=${currentUser.uid}&upgrade=true`;
          
          // Use Linking API to open the web browser
          Linking.openURL(webSubscriptionUrl)
            .catch(err => {
              console.error('Error opening browser for subscription:', err);
              // Fallback to SupportInfo screen if browser fails to open
              navigation.navigate('SupportInfo');
            });
        } else {
          // Fallback to SupportInfo screen if no user is found
          navigation.navigate('SupportInfo');
        }
      } else {
        // For paid users, show regular support options
        navigation.navigate('SupportInfo');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to SupportInfo screen
      navigation.navigate('SupportInfo');
    }
  };

  // Format the dates for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // Determine if user is on free tier to customize UI
  const isFreeUser = subscriptionDetails.tier === 'Free';
  
  // For MVP: Simplified messaging that emphasizes donation-based access
  const getDonationMessage = () => {
    if (isFreeUser) {
      return 'Support our mission by making a donation of any amount ($1, $5, $20, or custom) to unlock all premium features.';
    } else {
      return 'Thank you for your donation! You have full access to all premium features.';
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Subscription</Text>
      
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Current tier</Text>
          <Text style={[styles.subscriptionValue, isFreeUser && styles.freeHighlight]}>
            {subscriptionDetails.tier}
          </Text>
        </View>
        
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Amount</Text>
          <Text style={styles.subscriptionValue}>
            {isFreeUser ? 'Free' : `$${subscriptionDetails.amount}/month`}
          </Text>
        </View>
        
        {subscriptionDetails.startDate && (
          <View style={styles.subscriptionRow}>
            <Text style={styles.subscriptionLabel}>Started on</Text>
            <Text style={styles.subscriptionValue}>
              {formatDate(subscriptionDetails.startDate)}
            </Text>
          </View>
        )}
        
        {subscriptionDetails.nextPaymentDate && (
          <View style={styles.subscriptionRow}>
            <Text style={styles.subscriptionLabel}>Next payment</Text>
            <Text style={styles.subscriptionValue}>
              {formatDate(subscriptionDetails.nextPaymentDate)}
            </Text>
          </View>
        )}
        
        <View style={styles.messageContainer}>
          <Text style={styles.freeMessage}>{getDonationMessage()}</Text>
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.supportButton, isFreeUser && styles.primaryButton]}
            onPress={handleViewSupportOptions}
          >
            <Text style={styles.buttonText}>{isFreeUser ? 'Make a Donation' : 'Support Options'}</Text>
          </TouchableOpacity>
          
          {!isFreeUser && (
            <TouchableOpacity
            style={styles.manageButton}
            onPress={handleManageSubscription}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16, // More iOS-friendly rounded corners
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8, // Softer shadow for iOS look
    elevation: 3,
  },
  cardTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.sectionHeading,
    color: colors.black,
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: colors.neutralBorders,
    borderRadius: 12, // More iOS-friendly rounded corners
    overflow: 'hidden',
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14, // Slightly taller rows for better touch targets
    paddingHorizontal: 16,
    borderBottomWidth: 0.5, // Thinner borders for iOS aesthetic
    borderBottomColor: colors.border,
  },
  subscriptionLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  subscriptionValue: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.body,
    color: colors.black,
  },
  // Style for highlighting free tier
  freeHighlight: {
    color: colors.accent,
    fontWeight: '700',
  },
  // Container for free tier message
  messageContainer: {
    padding: 16,
    backgroundColor: colors.lightBackground || '#f8f8f8',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  // Style for free tier message
  freeMessage: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16, // More consistent spacing
    gap: 12,
  },
  supportButton: {
    flex: 1,
    backgroundColor: colors.black,
    borderRadius: 12, // More iOS-friendly rounded corners
    paddingVertical: 14, // Taller buttons for better touch targets
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
  },
  // Primary button style for upgrade action
  primaryButton: {
    backgroundColor: colors.accent,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  manageButton: {
    flex: 1,
    backgroundColor: 'transparent', // More minimalist look
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 12, // More iOS-friendly rounded corners
    paddingVertical: 14, // Taller buttons for better touch targets
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
  },
  buttonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.white,
  },
  manageButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.black,
  },
  manageSubscriptionButton: {
    backgroundColor: colors.accent,
    borderRadius: 12, // More iOS-friendly rounded corners
    paddingVertical: 14, // Taller buttons for better touch targets
    marginTop: 16,
    alignItems: 'center',
  },
  manageSubscriptionText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.white,
  },
});

export default SubscriptionCard;
