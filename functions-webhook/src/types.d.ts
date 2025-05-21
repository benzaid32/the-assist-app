/**
 * Enterprise-grade type definitions for Firebase Functions integration
 * 
 * These definitions create proper compatibility between Express and Firebase Functions
 * to ensure type safety while maintaining enterprise security standards
 */

import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

// Extend Express Request for Firebase Functions compatibility
declare global {
  namespace Express {
    // Add rawBody property needed for webhook signature verification
    interface Request {
      rawBody?: string | Buffer;
    }
  }
}

// Firebase Functions v6 specific type definitions
declare module 'firebase-functions' {
  namespace https {
    // Ensure the Request and Response types for functions.https.onRequest are compatible
    function onRequest(
      handler: (req: Request, res: Response) => void | Promise<void>
    ): functions.HttpsFunction;
  }
}
