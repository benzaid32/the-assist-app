import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Implement simplified logging to match project structure
const logError = (module: string, message: string, error?: any) => {
  console.error(`[${module}] ${message}`, error);
};

const logInfo = (module: string, message: string, data?: any) => {
  console.log(`[${module}] ${message}`, data);
};

/**
 * Subscription status types following enterprise-grade type safety
 */
export enum SubscriptionStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIAL = 'trial'
}

/**
 * Subscription tier types
 */
export enum SubscriptionTier {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  LIFETIME = 'lifetime'
}

/**
 * Subscription data interface with full typing
 */
export interface SubscriptionData {
  status: SubscriptionStatus;
  tier?: SubscriptionTier;
  startDate?: firebase.firestore.Timestamp;
  endDate?: firebase.firestore.Timestamp;
  renewalDate?: firebase.firestore.Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * SubscriptionService Class
 * Handles all subscription-related operations following enterprise standards
 */
export class SubscriptionService {
  private static readonly SUBSCRIBERS_COLLECTION = 'subscribers';
  private static readonly DEFAULT_POLLING_INTERVAL = 5000; // 5 seconds
  
  /**
   * Retrieves the current subscription status for a user
   * 
   * @param userId - The user's Firebase auth ID
   * @returns A promise resolving to the subscription data or null if not found
   */
  static async getSubscriptionStatus(userId: string): Promise<SubscriptionData | null> {
    try {
      // Input validation
      if (!userId) {
        logError('subscriptionService', 'getSubscriptionStatus called with empty userId');
        throw new Error('User ID is required');
      }

      // Get Firestore reference
      const db = firebase.firestore();
      const subscriberDoc = await db.collection(this.SUBSCRIBERS_COLLECTION).doc(userId).get();

      if (!subscriberDoc.exists) {
        return {
          status: SubscriptionStatus.INACTIVE
        };
      }

      const data = subscriberDoc.data();
      if (!data?.subscription) {
        return {
          status: SubscriptionStatus.INACTIVE
        };
      }

      return data.subscription as SubscriptionData;
    } catch (error) {
      // Enterprise-grade error handling
      logError('subscriptionService', 'Error fetching subscription status', error);
      
      // Fail gracefully with inactive status
      return {
        status: SubscriptionStatus.INACTIVE
      };
    }
  }

  /**
   * Polls the server to check for subscription status updates
   * Used after a user visits the web subscription page
   * 
   * @param userId - The user's Firebase auth ID
   * @param onStatusChange - Callback for when status changes
   * @param timeoutMs - How long to poll before stopping (default: 2 minutes)
   * @returns A function to cancel polling
   */
  static pollForSubscriptionUpdate(
    userId: string,
    onStatusChange: (status: SubscriptionData) => void,
    timeoutMs: number = 120000 // 2 minutes
  ): () => void {
    if (!userId) {
      logError('subscriptionService', 'pollForSubscriptionUpdate called with empty userId');
      return () => {};
    }

    let lastStatus: SubscriptionStatus | null = null;
    let polling = true;
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    // Set timeout to stop polling
    timeoutId = setTimeout(() => {
      polling = false;
      clearInterval(intervalId);
      logInfo('subscriptionService', 'Subscription polling timed out');
    }, timeoutMs);

    // Start polling
    const checkStatus = async () => {
      if (!polling) return;

      try {
        const subscription = await this.getSubscriptionStatus(userId);
        
        // Only trigger callback if status changed
        if (lastStatus !== subscription.status) {
          lastStatus = subscription.status;
          onStatusChange(subscription);
          
          // If status is now active, stop polling
          if (subscription && subscription.status === SubscriptionStatus.ACTIVE) {
            polling = false;
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            logInfo('subscriptionService', 'Subscription status changed to active, stopped polling');
          }
        }
      } catch (error) {
        logError('subscriptionService', 'Error during subscription polling', error);
      }
    };

    // Initial check
    checkStatus();
    
    // Set up interval for polling
    intervalId = setInterval(checkStatus, this.DEFAULT_POLLING_INTERVAL);

    // Return cancel function
    return () => {
      polling = false;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      logInfo('subscriptionService', 'Subscription polling manually canceled');
    };
  }

  /**
   * Determines if a user has an active subscription
   * 
   * @param userId - The user's Firebase auth ID
   * @returns A promise resolving to boolean indicating active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus(userId);
      return subscription?.status === SubscriptionStatus.ACTIVE || 
             subscription?.status === SubscriptionStatus.TRIAL;
    } catch (error) {
      logError('subscriptionService', 'Error checking active subscription', error);
      return false;
    }
  }
}
