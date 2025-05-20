import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

// Define subscription status types
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  UNPAID = 'unpaid'
}

// Define subscription tier types
export enum SubscriptionTier {
  FREE = 'free',
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  LIFETIME = 'lifetime'
}

// Subscription data interface
export interface SubscriptionData {
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  startDate?: Date;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  updatedAt: Date;
}

/**
 * StripeService - Handles all Stripe-related operations
 * Enterprise-grade implementation with proper error handling and typing
 */
export class StripeService {
  /**
   * Fetch Stripe public key (safe to expose to client)
   */
  static getPublicKey(): string {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key not found in environment variables');
    }
    return key as string;
  }

  /**
   * Updates a user's subscription status in Firestore
   */
  static async updateSubscriptionStatus(
    userId: string,
    subscriptionData: SubscriptionData
  ): Promise<void> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Update the subscriber document
      const subscriberRef = doc(collection(firestore, 'subscribers'), userId);
      const subscriberDoc = await getDoc(subscriberRef);
      
      if (subscriberDoc.exists()) {
        // Update existing subscriber document
        await updateDoc(subscriberRef, {
          subscription: subscriptionData
        });
      } else {
        // Create new subscriber document
        await setDoc(subscriberRef, {
          userId,
          subscription: subscriptionData,
          createdAt: new Date(),
        });
      }
      
      // Also update the main user document
      const userRef = doc(collection(firestore, 'users'), userId);
      await updateDoc(userRef, {
        hasActiveSubscription: 
          subscriptionData.status === SubscriptionStatus.ACTIVE || 
          subscriptionData.status === SubscriptionStatus.TRIALING,
        subscriptionStatus: subscriptionData.status,
        subscriptionTier: subscriptionData.tier,
        updatedAt: new Date(),
      });
      
      console.log(`Updated subscription status for user ${userId} to ${subscriptionData.status}`);
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw new Error(`Failed to update subscription status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get a user's subscription data
   */
  static async getSubscriptionData(userId: string): Promise<SubscriptionData | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const subscriberRef = doc(collection(firestore, 'subscribers'), userId);
      const subscriberDoc = await getDoc(subscriberRef);
      
      if (subscriberDoc.exists()) {
        const data = subscriberDoc.data();
        return data.subscription as SubscriptionData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      return null;
    }
  }
}
