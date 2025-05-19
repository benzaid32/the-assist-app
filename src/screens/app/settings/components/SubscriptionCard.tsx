import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { colors, typography } from '../../../../constants/theme';
import { ProfileData } from '../../../../services/api/profileService';

// Define a simplified app navigation type
type AppNavigation = Record<string, object | undefined>;

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
      // In a production app, this would navigate to a subscription management screen
      // or open a Stripe customer portal
      console.log('Navigate to subscription management');
    } catch (error) {
      console.error('Navigation error:', error);
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

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Subscription</Text>
      
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Current tier</Text>
          <Text style={styles.subscriptionValue}>
            {subscriptionDetails.tier}
          </Text>
        </View>
        
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Amount</Text>
          <Text style={styles.subscriptionValue}>
            ${subscriptionDetails.amount}/month
          </Text>
        </View>
        
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Started on</Text>
          <Text style={styles.subscriptionValue}>
            {formatDate(subscriptionDetails.startDate)}
          </Text>
        </View>
        
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Next payment</Text>
          <Text style={styles.subscriptionValue}>
            {formatDate(subscriptionDetails.nextPaymentDate)}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.manageSubscriptionButton}
          onPress={handleManageSubscription}
          testID="manage-subscription-button"
        >
          <Text style={styles.manageSubscriptionText}>Manage Subscription</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.black,
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.secondaryText,
  },
  subscriptionValue: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },
  manageSubscriptionButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  manageSubscriptionText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});

export default SubscriptionCard;
