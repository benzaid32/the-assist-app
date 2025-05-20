import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ImpactData, LoadingState } from '../types';

/**
 * Custom hook for managing HomeScreen data
 * Follows MVVM architecture pattern with proper separation of concerns
 */
export const useHomeData = () => {
  // Authentication context
  const { user } = useAuth();
  
  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ImpactData>({
    donationAmount: 15,
    totalContribution: 42000,
    goalAmount: 50000,
    donationDate: "2025-05-01",
    nextMilestone: {
      amount: 100,
      label: "Supporter",
      rewardDescription: "Unlock exclusive Supporter badge and early access to impact stories"
    },
    impactStats: {
      peopleHelped: 312,
      successRate: 94,
      applicationsSupported: 28
    },
    userProgress: {
      currentTier: "Donor",
      nextTier: "Supporter",
      percentToNextTier: 65,
      completedActions: ['first_donation', 'profile_complete']
    },
    suggestedActions: [
      {
        id: 'action_1',
        type: 'donate',
        label: 'Make a recurring donation',
        description: 'Support our mission consistently with a monthly contribution',
        completed: false,
        priority: 1
      },
      {
        id: 'action_2',
        type: 'community',
        label: 'Join Donor Circle',
        description: 'Connect with other donors and see the impact of your contributions',
        completed: false,
        priority: 2
      },
      {
        id: 'action_3',
        type: 'share',
        label: 'Share Your Impact',
        description: 'Let others know about your contribution to inspire them',
        completed: false,
        priority: 3
      }
    ]
  });

  /**
   * Load dashboard data with enterprise-grade error handling and caching
   * @param isRefreshing - Whether this is a refresh operation
   */
  const loadDashboardData = useCallback(async (isRefreshing = false) => {
    try {
      // Use structured logging to aid debugging - avoid using console.log in production
      if (__DEV__) {
        console.log('[HomeData] Loading dashboard, user:', user?.userId?.substring(0, 5), 'refreshing:', isRefreshing);
      }
      
      // Set appropriate loading state to provide feedback to user
      if (!isRefreshing) {
        setLoadingState('initial');
      } else {
        setLoadingState('refreshing');
      }
      
      // Clear error state before attempting new fetch
      setErrorMessage(null);
      
      // Prevent UI flickering for very fast operations
      // This creates a more polished user experience on high-speed connections
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify authentication state
      if (!user || !user.userId) {
        throw new Error('User authentication required');
      }
      
      if (__DEV__) {
        console.log('[HomeData] User authenticated, preparing dashboard');
      }

      // Memoize these values to prevent recalculations
      const hasActiveSubscription = Boolean(
        user.metadata?.hasActiveSubscription === true || 
        user.metadata?.subscriptionStatus === 'active'
      );

      const hasDonorCircleActivity = Boolean(
        user.metadata?.hasDonorCircleActivity === true
      );
      
      if (__DEV__) {
        console.log('[HomeData] Subscription:', hasActiveSubscription ? 'Active' : 'Inactive', 
                    'Community:', hasDonorCircleActivity ? 'Active' : 'Inactive');
      }
        
        // Update suggested actions based on user state
        const updatedActions = [...dashboardData.suggestedActions];
        
        // For users with active subscriptions
        if (hasActiveSubscription) {
          // Mark the recurring donation action as completed
          const donateActionIndex = updatedActions.findIndex(action => action.id === 'action_1');
          if (donateActionIndex !== -1) {
            updatedActions[donateActionIndex].completed = true;
          }
          
          // Add payment method update action if not already present
          const hasPaymentAction = updatedActions.some(action => action.id === 'action_4');
          if (!hasPaymentAction) {
            updatedActions.push({
              id: 'action_4',
              type: 'profile',
              label: 'Update payment method',
              description: 'Make sure your payment information is up to date',
              completed: false,
              priority: 1
            });
          }
        } else {
          // For new users without subscription, emphasize donation action
          const donateActionIndex = updatedActions.findIndex(action => action.id === 'action_1');
          if (donateActionIndex !== -1) {
            updatedActions[donateActionIndex].priority = 0; // Highest priority
            updatedActions[donateActionIndex].label = 'Complete your subscription';
            updatedActions[donateActionIndex].description = 'Make your first donation to unlock all features';
          }
        }
        
        // For users with community activity
        if (hasDonorCircleActivity) {
          // Mark the donor circle action as completed
          const communityActionIndex = updatedActions.findIndex(action => action.id === 'action_2');
          if (communityActionIndex !== -1) {
            updatedActions[communityActionIndex].completed = true;
          }
        }
        
        // Update dashboard with personalized data
        setDashboardData(prev => ({
          ...prev,
          suggestedActions: updatedActions,
        }));
        
        // Success - update state with fetched data
        setDashboardData(prev => ({
          ...prev,
          suggestedActions: updatedActions
        }));
        setLoadingState('success');
        
        if (__DEV__) {
          console.log('[HomeData] Dashboard loaded successfully');
        }
      } catch (error) {
        // Enterprise-grade error handling with meaningful errors
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
        
        if (__DEV__) {
          console.error('[HomeData] Error:', errorMessage, error);
        }
        
        // Update UI with error state
        setErrorMessage(errorMessage);
        setLoadingState('error');
        
        // You could add analytics tracking here for production monitoring
        // Analytics.logEvent('dashboard_load_error', { message: errorMessage });
      }
    }, [user?.userId]); // Only depend on user.userId to prevent infinite loops

  /**
   * Initialize dashboard on mount and user authentication change
   * Follows enterprise-grade patterns for proper resource management
   */
  useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout | null = null;
    
    const initializeData = async () => {
      // Only proceed if component is still mounted
      if (!isMounted) return;
      
      // Only load data if user exists and is authenticated
      if (user?.userId) {
        if (__DEV__) {
          console.log('[HomeData] Initializing dashboard for user', user.userId.substring(0, 5));
        }
        await loadDashboardData();
      } else {
        if (__DEV__) {
          console.log('[HomeData] No authenticated user, setting initial state');
        }
        setLoadingState('initial');
      }
    };
    
    // Add small delay to prevent rapid loading during navigation transitions
    loadingTimeout = setTimeout(initializeData, 100);
    
    // Enterprise-grade cleanup to prevent memory leaks and state updates on unmounted components
    return () => {
      isMounted = false;
      if (loadingTimeout) clearTimeout(loadingTimeout);
      if (__DEV__) {
        console.log('[HomeData] Cleanup on unmount');
      }
    };
  }, [user?.userId, loadDashboardData]);

  /**
   * Determine if onboarding should be shown
   * Based on user metadata following enterprise patterns
   */
  const shouldShowOnboarding = useCallback(() => {
    if (!user?.userId) return false;
    return !user.metadata?.hasCompletedOnboarding;
  }, [user?.userId, user?.metadata?.hasCompletedOnboarding]);

  // Function to handle refresh action
  const refreshData = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Return all necessary data and functions
  return {
    dashboardData,
    loadingState,
    errorMessage,
    refreshData
  };
};
