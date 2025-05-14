import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles } from '../../constants/theme';
import { formatCurrency, formatDate, formatCompactNumber } from '../../utils/formatters';
import { User } from '../../types/auth';

// Subscription tier types
export enum SubscriptionTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

// Subscription tier amounts
export const TIER_AMOUNTS = {
  [SubscriptionTier.BASIC]: 1,
  [SubscriptionTier.STANDARD]: 5,
  [SubscriptionTier.PREMIUM]: 20,
};

// Subscriber data interface
interface SubscriberData {
  subscriberId: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: 'active' | 'paused' | 'canceled';
  subscribedSince: Date;
  nextBillingDate: Date;
  totalContributed: number;
  paymentMethod: {
    type: 'card';
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    brand: string;
  };
  impactStats: {
    recipientsHelped: number;
    communityTotal: number;
  };
}

// Recipient story interface
interface RecipientStory {
  id: string;
  name: string;
  location: string;
  needType: string;
  amountReceived: number;
  story: string;
  date: Date;
  imageUrl?: string;
}

// Props interface
interface SubscriberDashboardProps {
  user: User;
  onManageSubscription: () => void;
  onViewImpact: () => void;
}

/**
 * SubscriberDashboard component displays subscription information and impact for subscriber users
 * @param user - The current user object
 * @param onManageSubscription - Function to handle subscription management navigation
 * @param onViewImpact - Function to handle viewing impact details
 */
export const SubscriberDashboard: React.FC<SubscriberDashboardProps> = ({
  user,
  onManageSubscription,
  onViewImpact,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null);
  const [recipientStories, setRecipientStories] = useState<RecipientStory[]>([]);

  // Fetch subscriber data
  useEffect(() => {
    const fetchSubscriberData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a production app, this would fetch real data from Firestore
        // For now, we'll use mock data
        const mockData: SubscriberData = {
          subscriberId: user.userId,
          subscriptionTier: SubscriptionTier.STANDARD,
          subscriptionStatus: 'active',
          subscribedSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          totalContributed: 450, // $5 * 90 days / 30 days per month = $15 per month * 3 months = $45
          paymentMethod: {
            type: 'card',
            last4: '4242',
            expiryMonth: 12,
            expiryYear: 2025,
            brand: 'Visa',
          },
          impactStats: {
            recipientsHelped: 3,
            communityTotal: 15750,
          },
        };

        const mockStories: RecipientStory[] = [
          {
            id: '1',
            name: 'Sarah J.',
            location: 'Atlanta, GA',
            needType: 'Rent',
            amountReceived: 750,
            story: 'Sarah is a single mother of two who was facing eviction after losing her job due to COVID-19. Thanks to The Assist App community, she was able to pay her rent and keep her family housed while she found new employment.',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          },
          {
            id: '2',
            name: 'Marcus T.',
            location: 'Chicago, IL',
            needType: 'Utilities',
            amountReceived: 350,
            story: 'Marcus, a healthcare worker, struggled with utility bills after reduced hours. The Assist App subscribers helped keep his lights on during a difficult winter.',
            date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          },
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubscriberData(mockData);
        setRecipientStories(mockStories);
      } catch (err) {
        console.error('Error fetching subscriber data:', err);
        setError('Failed to load your subscription data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriberData();
  }, [user.userId]);

  // Get tier display information
  const getTierInfo = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.BASIC:
        return {
          label: 'Basic',
          amount: '$1/month',
          color: colors.info,
        };
      case SubscriptionTier.STANDARD:
        return {
          label: 'Standard',
          amount: '$5/month',
          color: colors.accent,
        };
      case SubscriptionTier.PREMIUM:
        return {
          label: 'Premium',
          amount: '$20/month',
          color: colors.highlight,
        };
      default:
        return {
          label: 'Unknown',
          amount: '$0/month',
          color: colors.secondaryText,
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading your subscription data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)} // This would trigger a re-fetch in a real app
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No subscription data state
  if (!subscriberData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="card-outline" size={64} color={colors.secondaryText} />
        <Text style={styles.emptyTitle}>No Subscription Found</Text>
        <Text style={styles.emptyMessage}>
          You don't have an active subscription. Start making a difference by subscribing today.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onManageSubscription}>
          <Text style={styles.primaryButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get tier display information
  const tierInfo = getTierInfo(subscriberData.subscriptionTier);

  return (
    <ScrollView style={styles.container}>
      {/* Subscription Card */}
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionHeaderText}>Your Subscription</Text>
          <TouchableOpacity onPress={onManageSubscription}>
            <Text style={styles.manageText}>Manage</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tierContainer}>
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.tierLabel}>{tierInfo.label}</Text>
          </View>
          <Text style={styles.tierAmount}>{tierInfo.amount}</Text>
        </View>
        
        <View style={styles.subscriptionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: subscriberData.subscriptionStatus === 'active' ? colors.success : colors.warning }
                ]} 
              />
              <Text style={styles.detailValue}>
                {subscriberData.subscriptionStatus.charAt(0).toUpperCase() + subscriberData.subscriptionStatus.slice(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing Date</Text>
            <Text style={styles.detailValue}>{formatDate(subscriberData.nextBillingDate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {subscriberData.paymentMethod.brand} •••• {subscriberData.paymentMethod.last4}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Member Since</Text>
            <Text style={styles.detailValue}>{formatDate(subscriberData.subscribedSince)}</Text>
          </View>
        </View>
      </View>

      {/* Impact Card */}
      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <Text style={styles.impactHeaderText}>Your Impact</Text>
          <TouchableOpacity onPress={onViewImpact}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(subscriberData.totalContributed)}</Text>
            <Text style={styles.statLabel}>Total Contributed</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{subscriberData.impactStats.recipientsHelped}</Text>
            <Text style={styles.statLabel}>People Helped</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(subscriberData.impactStats.communityTotal)}</Text>
            <Text style={styles.statLabel}>Community Total</Text>
          </View>
        </View>
        
        <View style={styles.impactMessage}>
          <Ionicons name="heart" size={20} color={colors.accent} style={styles.impactIcon} />
          <Text style={styles.impactText}>
            Your monthly contribution is making a real difference in people's lives.
          </Text>
        </View>
      </View>

      {/* Recipient Stories */}
      <View style={styles.storiesCard}>
        <Text style={styles.storiesHeaderText}>Recent Impact Stories</Text>
        
        {recipientStories.length === 0 ? (
          <View style={styles.emptyStoriesContainer}>
            <Text style={styles.emptyStoriesText}>
              Impact stories will appear here as your contributions help people in need.
            </Text>
          </View>
        ) : (
          recipientStories.map((story) => (
            <View key={story.id} style={styles.storyItem}>
              <View style={styles.storyHeader}>
                <View style={styles.storyProfile}>
                  {story.imageUrl ? (
                    <Image source={{ uri: story.imageUrl }} style={styles.storyImage} />
                  ) : (
                    <View style={styles.storyImagePlaceholder}>
                      <Text style={styles.storyImageInitial}>{story.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.storyMeta}>
                    <Text style={styles.storyName}>{story.name}</Text>
                    <Text style={styles.storyLocation}>{story.location}</Text>
                  </View>
                </View>
                <View style={styles.storyNeedContainer}>
                  <Text style={styles.storyNeedType}>{story.needType}</Text>
                  <Text style={styles.storyAmount}>{formatCurrency(story.amountReceived)}</Text>
                </View>
              </View>
              
              <Text style={styles.storyContent}>{story.story}</Text>
              
              <Text style={styles.storyDate}>Helped on {formatDate(story.date)}</Text>
            </View>
          ))
        )}
        
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewImpact}>
          <Text style={styles.viewAllButtonText}>View All Impact Stories</Text>
        </TouchableOpacity>
      </View>

      {/* Community Stats */}
      <View style={styles.communityCard}>
        <Text style={styles.communityHeaderText}>Community Impact</Text>
        
        <View style={styles.communityStats}>
          <View style={styles.communityStat}>
            <Text style={styles.communityStatValue}>{formatCompactNumber(1250)}</Text>
            <Text style={styles.communityStatLabel}>Monthly Subscribers</Text>
          </View>
          
          <View style={styles.communityStat}>
            <Text style={styles.communityStatValue}>{formatCompactNumber(75)}</Text>
            <Text style={styles.communityStatLabel}>Recipients This Month</Text>
          </View>
          
          <View style={styles.communityStat}>
            <Text style={styles.communityStatValue}>{formatCurrency(15750)}</Text>
            <Text style={styles.communityStatLabel}>Total Distributed</Text>
          </View>
        </View>
        
        <View style={styles.communityMessage}>
          <Text style={styles.communityMessageText}>
            Together, we're creating a community of direct support. Thank you for being part of this movement.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.error,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
  },
  subscriptionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionHeaderText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
  },
  manageText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.accent,
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  tierLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.white,
  },
  tierAmount: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
  },
  subscriptionDetails: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
  },
  detailValue: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  impactCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactHeaderText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
  },
  viewMoreText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.accent,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.primaryText,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  impactMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  impactIcon: {
    marginRight: 8,
  },
  impactText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    flex: 1,
  },
  storiesCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storiesHeaderText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
    marginBottom: 16,
  },
  emptyStoriesContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyStoriesText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  storyItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storyImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storyImageInitial: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.subheading,
    color: colors.white,
  },
  storyMeta: {
    flex: 1,
  },
  storyName: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 2,
  },
  storyLocation: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
  },
  storyNeedContainer: {
    alignItems: 'flex-end',
  },
  storyNeedType: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.accent,
    marginBottom: 2,
  },
  storyAmount: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  storyContent: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 12,
    lineHeight: 22,
  },
  storyDate: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
    textAlign: 'right',
  },
  viewAllButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.accent,
  },
  communityCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityHeaderText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
    marginBottom: 16,
  },
  communityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  communityStat: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityStatValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
    marginBottom: 4,
  },
  communityStatLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  communityMessage: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  communityMessageText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
  },
});

export default SubscriberDashboard;
