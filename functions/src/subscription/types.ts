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
  startDate?: FirebaseFirestore.Timestamp;
  endDate?: FirebaseFirestore.Timestamp;
  renewalDate?: FirebaseFirestore.Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  updatedAt?: FirebaseFirestore.Timestamp;
  metadata?: Record<string, any>;
}

/**
 * Rate limiting data structure
 */
export interface RateLimitData {
  userId: string;
  endpoint: string;
  count: number;
  firstRequest: FirebaseFirestore.Timestamp;
  lastRequest: FirebaseFirestore.Timestamp;
}

/**
 * Data integrity check result
 */
export interface IntegrityCheckResult {
  userId: string;
  timestamp: FirebaseFirestore.Timestamp;
  isValid: boolean;
  errors?: string[];
  syncRequired?: boolean;
  action?: 'none' | 'sync' | 'alert' | 'disable';
  actionTaken?: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

/**
 * Subscriber profile data
 */
export interface SubscriberProfile {
  userId: string;
  email: string;
  name?: string;
  subscription: SubscriptionData;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
