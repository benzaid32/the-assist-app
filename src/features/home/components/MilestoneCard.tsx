import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { colors, typography } from '../../../constants/theme';

interface MilestoneInfo {
  amount: number;
  label: string;
  rewardDescription: string;
}

interface ProgressInfo {
  currentTier: string;
  nextTier: string;
  percentToNextTier: number;
}

interface MilestoneCardProps {
  milestone: MilestoneInfo;
  progress: ProgressInfo;
}

/**
 * MilestoneCard component - Displays user's progress toward next milestone
 * Enterprise-grade implementation with WCAG 2.1 AA accessibility
 */
export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  progress
}) => {
  // Ensure percent is within valid range to prevent UI glitches
  const safePercent = Math.min(Math.max(progress.percentToNextTier, 0), 100);
  
  return (
    <View style={styles.container}>
      <Text style={[typography.styles.title3, styles.title]}>
        Next Milestone
      </Text>
      
      <View style={styles.content}>
        <View style={styles.milestoneCircle}>
          <Text style={[typography.styles.title2, styles.milestoneAmount]}>
            ${milestone.amount}
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[typography.styles.callout, styles.milestoneName]}>
            {milestone.label}
          </Text>
          <Text style={[typography.styles.caption1, styles.milestoneDescription]}>
            {milestone.rewardDescription}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={[typography.styles.footnote, styles.progressLabel]}>
          {progress.currentTier} → {progress.nextTier}
        </Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBar, { width: `${safePercent}%` }]}
            accessibilityLabel={`Progress to next tier: ${Math.round(safePercent)}% complete`}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    color: colors.text.primary,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.accent.secondary}30`, // 30% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneAmount: {
    color: colors.accent.secondary,
  },
  infoContainer: {
    flex: 1,
  },
  milestoneName: {
    color: colors.text.primary,
    marginBottom: 4,
  },
  milestoneDescription: {
    color: colors.text.secondary,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    color: colors.text.secondary,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.surface.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.accent.secondary,
    borderRadius: 3,
  }
});
