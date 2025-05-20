import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../../../constants/theme';

interface ImpactSummaryCardProps {
  totalContribution: number;
  goalAmount: number;
  peopleHelped: number;
  successRate: number;
  onDonatePress: () => void;
}

/**
 * ImpactSummaryCard component - Displays donation impact metrics
 * WCAG 2.1 AA compliant with proper accessibility labeling
 */
export const ImpactSummaryCard: React.FC<ImpactSummaryCardProps> = ({
  totalContribution,
  goalAmount,
  peopleHelped,
  successRate,
  onDonatePress
}) => {
  const navigation = useNavigation();
  
  // Calculate progress with validation to prevent UI glitches
  const calculateProgress = () => {
    if (totalContribution <= 0 || goalAmount <= 0) {
      return 0;
    }
    const progress = (totalContribution / goalAmount) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };
  
  const progressPercentage = calculateProgress();
  
  return (
    <View 
      style={styles.impactCard}
      accessibilityRole="summary"
      accessible={true}
      accessibilityLabel={`Your impact summary. Total contribution: $${totalContribution / 100}. Progress: ${Math.round(progressPercentage)}% to goal.`}
    >
      <View style={styles.impactHeader}>
        <Text style={[typography.styles.title3, styles.impactTitle]}>
          Your Impact
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ImpactDetails' as never)}
          accessibilityLabel="View detailed impact"
          accessibilityRole="button"
          accessible={true}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text style={[typography.styles.callout, styles.viewDetailsText]}>
            Details
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[typography.styles.title2, styles.statValue]}>
            {peopleHelped}
          </Text>
          <Text style={[typography.styles.caption1, styles.statLabel]}>
            People Helped
          </Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={[typography.styles.title2, styles.statValue]}>
            ${totalContribution / 100}
          </Text>
          <Text style={[typography.styles.caption1, styles.statLabel]}>
            Total Donated
          </Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={[typography.styles.title2, styles.statValue]}>
            {successRate}%
          </Text>
          <Text style={[typography.styles.caption1, styles.statLabel]}>
            Success Rate
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[typography.styles.footnote, styles.progressLabel]}>
            Campaign Progress
          </Text>
          <Text style={[typography.styles.footnote, styles.progressAmount]}>
            ${totalContribution / 100} of ${goalAmount / 100}
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBar, { width: `${progressPercentage}%` }]}
            accessibilityLabel={`Progress bar: ${Math.round(progressPercentage)}% complete`}
          />
        </View>
        
        <Text style={[typography.styles.caption1, styles.progressCaption]}>
          ${(goalAmount - totalContribution) / 100} more needed to reach our goal
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={onDonatePress}
        accessibilityLabel="Make a donation"
        accessibilityRole="button"
        accessible={true}
      >
        <Text style={[typography.styles.button, styles.primaryButtonText]}>
          Make a Donation
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  impactCard: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.border.regular,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactTitle: {
    color: colors.text.primary,
  },
  viewDetailsText: {
    color: colors.accent.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    color: colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border.light,
    marginHorizontal: 8,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: colors.text.secondary,
  },
  progressAmount: {
    color: colors.text.secondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surface.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.accent.primary,
    borderRadius: 4,
  },
  progressCaption: {
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.border.regular,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  }
});
