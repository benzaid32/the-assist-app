import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { SubscriptionService } from '../../../services/api/subscriptionService';

/**
 * Hook to check if current user has subscriber/supporter access
 * Following enterprise-grade patterns with proper error handling and state management
 */
export function useSubscriberAccess() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkSubscription = async () => {
      if (!user?.userId) {
        if (isMounted) {
          setHasAccess(false);
          setLoading(false);
        }
        return;
      }
      
      try {
        const isSubscriber = await SubscriptionService.hasActiveSubscription(user.userId);
        
        if (isMounted) {
          setHasAccess(isSubscriber);
          setError(null);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        if (isMounted) {
          setHasAccess(false);
          setError('Failed to verify subscription status');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkSubscription();
    
    // Setup subscription polling for changes
    let unsubscribe: (() => void) | undefined;
    
    if (user?.userId) {
      // Poll for subscription changes every 60 seconds
      unsubscribe = SubscriptionService.pollForSubscriptionUpdate(
        user.userId,
        (subscription) => {
          if (isMounted) {
            const isActive = subscription.status === 'active' || 
                             subscription.status === 'trialing';
            setHasAccess(isActive);
          }
        },
        300000 // 5 minutes timeout
      );
    }
    
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);
  
  return { hasAccess, loading, error };
}
