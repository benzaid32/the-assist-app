/**
 * Home feature module types
 * Following enterprise-grade architecture with proper type safety
 */

export type ActionType = 'donate' | 'share' | 'community' | 'profile';

export interface SuggestedAction {
  id: string;
  type: ActionType;
  label: string;
  description: string;
  completed: boolean;
  priority: number;
}

export interface ImpactData {
  donationAmount: number;
  totalContribution: number;
  goalAmount: number;
  donationDate: string;
  nextMilestone: {
    amount: number;
    label: string;
    rewardDescription: string;
  };
  impactStats: {
    peopleHelped: number;
    successRate: number;
    applicationsSupported: number;
  };
  userProgress: {
    currentTier: string;
    nextTier: string;
    percentToNextTier: number;
    completedActions: string[];
  };
  suggestedActions: SuggestedAction[];
}

// Define type for loading states
export type LoadingState = 'initial' | 'refreshing' | 'success' | 'error';
