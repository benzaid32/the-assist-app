import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { logger } from '../utils/logger';
import { IntegrityCheckResult, SubscriberProfile, SubscriptionStatus } from './types';
import { validateSubscriptionWithStripe, mapStripeStatusToAppStatus } from './validation';

// We'll initialize Stripe in the function to avoid issues with cold starts
// and configuration not being available during builds
let stripe: any;

// Helper function to get Stripe instance
function getStripeInstance() {
  if (!stripe) {
    // Dynamically import Stripe to avoid issues during build time
    // This is a common pattern for Firebase Functions
    const Stripe = require('stripe');
    stripe = new Stripe(functions.config().stripe.secret_key, {
      apiVersion: '2022-11-15',
      maxNetworkRetries: 3,
    });
  }
  return stripe;
}

/**
 * Scheduled function that runs a data integrity check on subscriptions
 * Enterprise-grade implementation that follows best practices for reliability
 */
export const runSubscriptionIntegrityCheck = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    try {
      logger.info('Starting subscription data integrity check');
      
      const db = admin.firestore();
      
      // Get all subscribers with active subscriptions
      const subscribersSnapshot = await db
        .collection('subscribers')
        .where('subscription.status', 'in', [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIAL,
          SubscriptionStatus.PAST_DUE
        ])
        .get();
      
      if (subscribersSnapshot.empty) {
        logger.info('No active subscriptions found to validate');
        return null;
      }
      
      logger.info(`Found ${subscribersSnapshot.size} active subscriptions to validate`);
      
      const batch = db.batch();
      const results: IntegrityCheckResult[] = [];
      const now = admin.firestore.Timestamp.now();
      
      // Process each subscriber
      const promises = subscribersSnapshot.docs.map(async (doc) => {
        const subscriber = doc.data() as SubscriberProfile;
        const userId = doc.id;
        
        // Skip if no subscription data
        if (!subscriber.subscription?.stripeSubscriptionId) {
          logger.warn(`Subscriber ${userId} has active status but no Stripe subscription ID`);
          
          const result: IntegrityCheckResult = {
            userId,
            timestamp: now,
            isValid: false,
            errors: ['Active subscription status but missing Stripe subscription ID'],
            action: 'alert',
            actionTaken: true
          };
          
          results.push(result);
          return;
        }
        
        try {
          // Validate the subscription against Stripe
          const { stripeSubscriptionId } = subscriber.subscription;
          
          // Initialize Stripe client
          getStripeInstance();
          
          const validationResult = await validateSubscriptionWithStripe(
            userId, 
            stripeSubscriptionId
          );
          
          if (!validationResult.isValid) {
            logger.warn(`Invalid subscription for user ${userId}`, validationResult);
            
            // If there's a mismatch between Stripe and Firestore, sync the data
            if (validationResult.stripeStatus) {
              const mappedStatus = mapStripeStatusToAppStatus(validationResult.stripeStatus);
              
              // Only update if status is different
              if (mappedStatus !== subscriber.subscription.status) {
                logger.info(`Correcting subscription status for user ${userId}`, {
                  from: subscriber.subscription.status,
                  to: mappedStatus
                });
                
                // Update subscription in Firestore
                const subscriberRef = db.collection('subscribers').doc(userId);
                batch.update(subscriberRef, {
                  'subscription.status': mappedStatus,
                  'subscription.updatedAt': now,
                  'subscription.metadata.syncedByIntegrityCheck': true
                });
                
                const result: IntegrityCheckResult = {
                  userId,
                  timestamp: now,
                  isValid: false,
                  errors: validationResult.errors,
                  syncRequired: true,
                  action: 'sync',
                  actionTaken: true,
                  stripeSubscriptionId: subscriber.subscription.stripeSubscriptionId,
                  stripeCustomerId: subscriber.subscription.stripeCustomerId
                };
                
                results.push(result);
              }
            } else {
              // We couldn't get Stripe status, just log the error
              const result: IntegrityCheckResult = {
                userId,
                timestamp: now,
                isValid: false,
                errors: validationResult.errors,
                action: 'alert',
                actionTaken: true,
                stripeSubscriptionId: subscriber.subscription.stripeSubscriptionId
              };
              
              results.push(result);
            }
          } else {
            // Valid subscription, no action needed
            results.push({
              userId,
              timestamp: now,
              isValid: true,
              action: 'none',
              stripeSubscriptionId: subscriber.subscription.stripeSubscriptionId
            });
          }
        } catch (error) {
          logger.error(`Error validating subscription for user ${userId}`, { error });
          
          results.push({
            userId,
            timestamp: now,
            isValid: false,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            action: 'alert',
            actionTaken: true
          });
        }
      });
      
      // Wait for all validation processes to complete
      await Promise.all(promises);
      
      // Check if we have updates to commit
      // We're accessing an internal property, but need to check if any operations exist
      // In a production app, you would track this with a counter variable
      const hasUpdates = batch as any && (batch as any)._ops && (batch as any)._ops.length > 0;
      const updateCount = hasUpdates ? (batch as any)._ops.length : 0;
      
      // Commit all the updates in a batch if needed
      if (hasUpdates) {
        await batch.commit();
        logger.info(`Updated ${updateCount} subscriptions during integrity check`);
      }
      
      // Record the results of this integrity check
      await db.collection('subscriptionIntegrityChecks').add({
        timestamp: now,
        totalChecked: subscribersSnapshot.size,
        validCount: results.filter(r => r.isValid).length,
        invalidCount: results.filter(r => !r.isValid).length,
        syncedCount: results.filter(r => r.action === 'sync').length,
        alertedCount: results.filter(r => r.action === 'alert').length,
        results
      });
      
      logger.info('Subscription integrity check completed', {
        total: subscribersSnapshot.size,
        valid: results.filter(r => r.isValid).length,
        invalid: results.filter(r => !r.isValid).length,
        synced: results.filter(r => r.action === 'sync').length
      });
      
      return null;
    } catch (error) {
      logger.critical('Failed to complete subscription integrity check', { error });
      return null;
    }
  });

/**
 * On-demand HTTP function to run an immediate integrity check for a specific user
 * Requires admin authentication
 */
export const checkSubscriptionIntegrity = functions.https.onCall(async (data, context) => {
  try {
    // Ensure the caller is authenticated and has admin rights
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    
    // Check for admin role
    const isAdmin = context.auth.token.admin === true;
    if (!isAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
    }
    
    const { userId } = data;
    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
    }
    
    // Get the subscriber record
    const db = admin.firestore();
    const subscriberDoc = await db.collection('subscribers').doc(userId).get();
    
    if (!subscriberDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Subscriber not found');
    }
    
    const subscriber = subscriberDoc.data() as SubscriberProfile;
    if (!subscriber.subscription?.stripeSubscriptionId) {
      return {
        isValid: false,
        errors: ['No Stripe subscription ID found'],
        userId,
        timestamp: admin.firestore.Timestamp.now()
      };
    }
    
    // Validate the subscription
    const validationResult = await validateSubscriptionWithStripe(
      userId,
      subscriber.subscription.stripeSubscriptionId
    );
    
    // If auto-fix is enabled and there's a problem, fix it
    if (data.autoFix && !validationResult.isValid && validationResult.stripeStatus) {
      const mappedStatus = mapStripeStatusToAppStatus(validationResult.stripeStatus);
      
      // Only update if status is different
      if (mappedStatus !== subscriber.subscription.status) {
        const now = admin.firestore.Timestamp.now();
        
        // Update subscription in Firestore
        await db.collection('subscribers').doc(userId).update({
          'subscription.status': mappedStatus,
          'subscription.updatedAt': now,
          'subscription.metadata.syncedByAdminAction': true,
          'subscription.metadata.syncedBy': context.auth.uid
        });
        
        return {
          isValid: false,
          errors: validationResult.errors,
          fixed: true,
          oldStatus: subscriber.subscription.status,
          newStatus: mappedStatus,
          userId,
          timestamp: now
        };
      }
    }
    
    return {
      ...validationResult,
      userId,
      timestamp: admin.firestore.Timestamp.now()
    };
  } catch (error) {
    logger.error('Error in checkSubscriptionIntegrity', { error });
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'An internal error occurred while validating the subscription'
    );
  }
});
