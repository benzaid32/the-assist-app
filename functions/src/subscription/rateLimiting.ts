import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';
import { RateLimitData } from './types';

const RATE_LIMITS = {
  // Max 10 requests per minute for subscription status checks
  SUBSCRIPTION_CHECK: { count: 10, windowSeconds: 60 },
  
  // Max 5 requests per minute for subscription updates
  SUBSCRIPTION_UPDATE: { count: 5, windowSeconds: 60 },
  
  // Max 3 requests per minute for payment method changes
  PAYMENT_METHOD_UPDATE: { count: 3, windowSeconds: 60 }
};

/**
 * Checks if a request should be rate-limited
 * Enterprise-grade rate limiting that prevents abuse while allowing legitimate usage
 * 
 * @param userId - User ID making the request
 * @param endpoint - The endpoint being accessed (must match a key in RATE_LIMITS)
 * @returns Promise resolving to whether the request should be limited
 */
export async function shouldRateLimit(
  userId: string, 
  endpoint: keyof typeof RATE_LIMITS
): Promise<{ limited: boolean; resetTime?: Date; currentCount?: number }> {
  try {
    if (!userId || !endpoint) {
      logger.error('Invalid parameters for rate limiting', { userId, endpoint });
      return { limited: true };
    }
    
    const limits = RATE_LIMITS[endpoint];
    if (!limits) {
      logger.error(`No rate limits defined for endpoint: ${endpoint}`);
      return { limited: false }; // Don't limit if configuration is missing
    }
    
    const db = admin.firestore();
    const rateDoc = db.collection('rateLimits').doc(`${userId}_${endpoint}`);
    
    // Get the current rate limit data or create new
    const now = admin.firestore.Timestamp.now();
    const rateSnapshot = await rateDoc.get();
    
    if (!rateSnapshot.exists) {
      // First request, create new rate limit record
      const newRateLimit: RateLimitData = {
        userId,
        endpoint,
        count: 1,
        firstRequest: now,
        lastRequest: now
      };
      
      await rateDoc.set(newRateLimit);
      return { limited: false, currentCount: 1 };
    }
    
    // Get existing rate limit data
    const rateData = rateSnapshot.data() as RateLimitData;
    
    // Check if the time window has reset
    const windowInMs = limits.windowSeconds * 1000;
    const windowStartTime = rateData.firstRequest.toMillis();
    const currentTime = now.toMillis();
    
    // If the window has expired, reset the counter
    if (currentTime - windowStartTime > windowInMs) {
      const updatedRateLimit: RateLimitData = {
        userId,
        endpoint,
        count: 1,
        firstRequest: now,
        lastRequest: now
      };
      
      await rateDoc.set(updatedRateLimit);
      return { limited: false, currentCount: 1 };
    }
    
    // Window is still active, check if count exceeds limit
    if (rateData.count >= limits.count) {
      // Calculate time until reset
      const resetTime = new Date(windowStartTime + windowInMs);
      
      logger.warn(`Rate limit exceeded for user ${userId} on ${endpoint}`, {
        currentCount: rateData.count,
        limit: limits.count,
        resetTime
      });
      
      return { 
        limited: true, 
        resetTime,
        currentCount: rateData.count
      };
    }
    
    // Update the counter
    await rateDoc.update({
      count: admin.firestore.FieldValue.increment(1),
      lastRequest: now
    });
    
    return { 
      limited: false, 
      currentCount: rateData.count + 1
    };
  } catch (error) {
    logger.error('Error in rate limiting', { error, userId, endpoint });
    
    // Fail open to prevent blocking legitimate requests due to errors
    // This is a trade-off that prioritizes availability over strict rate limiting
    return { limited: false };
  }
}

/**
 * Helper function to add rate limiting headers to HTTP responses
 */
export function addRateLimitHeaders(
  res: any,
  results: { limited: boolean; resetTime?: Date; currentCount?: number },
  endpoint: keyof typeof RATE_LIMITS
): void {
  const limits = RATE_LIMITS[endpoint];
  
  if (!limits) return;
  
  const remaining = results.limited ? 0 : (limits.count - (results.currentCount || 0));
  
  res.set('X-RateLimit-Limit', limits.count.toString());
  res.set('X-RateLimit-Remaining', remaining.toString());
  
  if (results.resetTime) {
    res.set('X-RateLimit-Reset', Math.floor(results.resetTime.getTime() / 1000).toString());
  }
  
  if (results.limited) {
    res.set('Retry-After', Math.ceil((results.resetTime!.getTime() - Date.now()) / 1000).toString());
  }
}
