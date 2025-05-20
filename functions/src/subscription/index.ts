import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { shouldRateLimit, addRateLimitHeaders } from './rateLimiting';
import { validateSubscriptionChanges } from './validation';
// Import logger directly
import { logger } from '../utils/logger';
import { runSubscriptionIntegrityCheck, checkSubscriptionIntegrity } from './integrityCheck';

// Export scheduled integrity check
export { runSubscriptionIntegrityCheck, checkSubscriptionIntegrity };

/**
 * Middleware for subscription endpoints to enforce rate limiting
 */
export const subscriptionApiRateLimit = functions.https.onRequest(async (req, res) => {
  // Extract user ID from authorization header or query param
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.query.token as string;
  
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No authentication token provided' });
    return;
  }
  
  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Check if user is rate limited for this endpoint
    const endpoint = req.path.includes('update') 
      ? 'SUBSCRIPTION_UPDATE' 
      : 'SUBSCRIPTION_CHECK';
    
    const rateLimitCheck = await shouldRateLimit(userId, endpoint);
    
    // Add rate limit headers to the response
    addRateLimitHeaders(res, rateLimitCheck, endpoint);
    
    if (rateLimitCheck.limited) {
      logger.warn(`Rate limited subscription API request for user ${userId}`, {
        endpoint,
        path: req.path,
        method: req.method,
        resetTime: rateLimitCheck.resetTime
      });
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: rateLimitCheck.resetTime 
          ? Math.ceil((rateLimitCheck.resetTime.getTime() - Date.now()) / 1000)
          : 60
      });
      return;
    }
    
    // If the request is for an update, validate the changes
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const db = admin.firestore();
      const subscriberDoc = await db.collection('subscribers').doc(userId).get();
      
      if (!subscriberDoc.exists) {
        res.status(404).json({ error: 'Subscriber not found' });
        return;
      }
      
      // Extract only the subscription data for validation
      const subscriptionData = req.body.subscription;
      if (!subscriptionData) {
        res.status(400).json({ error: 'No subscription data provided' });
        return;
      }
      
      const currentSubscription = subscriberDoc.data()?.subscription || {};
      const validation = validateSubscriptionChanges(currentSubscription, subscriptionData);
      
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Invalid subscription data',
          details: validation.errors
        });
        return;
      }
    }
    
    // Forward the request to the actual subscription API
    // (In a real implementation, you would use Firebase Functions HTTPs callable functions
    // or route the request to another function)
    res.json({
      success: true,
      message: 'Subscription API request passed rate limiting and validation'
    });
  } catch (error) {
    logger.error('Error in subscription rate limiting middleware', { error });
    
    // Type guard for Firebase Auth errors which have a 'code' property
    const isFirebaseAuthError = (err: unknown): err is { code: string } => {
      return typeof err === 'object' && 
             err !== null && 
             'code' in err && 
             typeof (err as any).code === 'string';
    };
    
    // Safe access to error properties with proper type checking
    if (isFirebaseAuthError(error)) {
      if (error.code === 'auth/id-token-expired') {
        res.status(401).json({ error: 'Unauthorized: Token expired' });
        return;
      }
      
      if (error.code === 'auth/invalid-id-token') {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
      }
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred processing your request'
    });
  }
});

/**
 * Secure function to get subscription status with rate limiting
 */
export const getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to access subscription status'
    );
  }
  
  const userId = context.auth.uid;
  
  try {
    // Check rate limiting
    const rateLimitCheck = await shouldRateLimit(userId, 'SUBSCRIPTION_CHECK');
    
    if (rateLimitCheck.limited) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Rate limit exceeded for subscription status checks. Please try again later.',
        {
          retryAfter: rateLimitCheck.resetTime 
            ? Math.ceil((rateLimitCheck.resetTime.getTime() - Date.now()) / 1000)
            : 60
        }
      );
    }
    
    // Get subscription status from Firestore
    const db = admin.firestore();
    const subscriberDoc = await db.collection('subscribers').doc(userId).get();
    
    if (!subscriberDoc.exists) {
      return { status: 'inactive' };
    }
    
    const subscription = subscriberDoc.data()?.subscription;
    
    // Record the access for audit purposes
    await db.collection('subscriptionStatusAccesses').add({
      userId,
      timestamp: admin.firestore.Timestamp.now(),
      userAgent: context.rawRequest?.headers['user-agent'] || 'Unknown'
    });
    
    return subscription || { status: 'inactive' };
  } catch (error) {
    logger.error('Error getting subscription status', { error, userId });
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred retrieving your subscription status'
    );
  }
});
