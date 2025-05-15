import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { colors, typography } from '../../../../constants/theme';
import { RootStackParamList } from '../../../../../App';

type SubscriptionCardProps = {
  subscriptionDetails: {
    tier: string;
    amount: number;
    startDate: string;
    nextPaymentDate: string;
  };
  navigation: NavigationProp<RootStackParamList>;
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

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Subscription</Text>
      
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Current tier</Text>
          <Text style={styles.subscriptionValue}>
            {subscriptionDetails?.tier || 'Standard'}
          </Text>
        </View>
        
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Amount</Text>
          <Text style={styles.subscriptionValue}>
            ${subscriptionDetails?.amount || 10}/month
          </Text>
        </View>
        
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Started on</Text>
          <Text style={styles.subscriptionValue}>
            {subscriptionDetails?.startDate || 'May 1, 2023'}
          </Text>
        </View>
        
        <View style={styles.subscriptionRow}>
          <Text style={styles.subscriptionLabel}>Next payment</Text>
          <Text style={styles.subscriptionValue}>
            {subscriptionDetails?.nextPaymentDate || 'Jun 1, 2023'}
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
