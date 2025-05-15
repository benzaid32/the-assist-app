/**
 * Enterprise-grade pre-authentication service that delegates to our HTTP API
 * This file provides a clean adapter layer between our component and the API service
 * 
 * Following enterprise-grade development guidelines:
 * 1. Clean separation of concerns
 * 2. Proper error handling
 * 3. Type safety
 * 4. Documentation
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { UserType } from '../../types/auth';

// Import our enterprise-grade API service
import { PreAuthService } from '../api/preAuthService';

/**
 * Sends a verification code to an email without creating a Firebase Auth user
 * Uses our enterprise-grade API service that handles rate limiting and security
 * 
 * @param firestore - Firebase Firestore instance (unused, kept for backwards compatibility)
 * @param email - User email
 * @param userType - User type (subscriber or applicant)
 * @returns Promise resolving to verification ID and code (code is only for dev)
 */
export const sendVerificationCode = async (
  _firestore: firebase.firestore.Firestore,
  email: string,
  userType: UserType
): Promise<{ verificationId: string; verificationCode: string }> => {
  try {
    // Call the enterprise-grade API service
    const verificationId = await PreAuthService.sendVerificationCode(email, userType);

    // In production we don't have access to the code directly (security best practice)
    // For development, we'll return a placeholder code that will be visible in logs
    const verificationCode = __DEV__ ? '000000' : '';

    return { 
      verificationId, 
      verificationCode 
    };
  } catch (error) {
    // Proper error handling and propagation
    console.error('Error in sendVerificationCode:', error);
    throw error;
  }
};

/**
 * Verifies an email with the provided verification code
 * Uses our secure API endpoint to validate the code
 * 
 * @param firestore - Firebase Firestore instance (unused, kept for backwards compatibility)
 * @param verificationId - Verification ID
 * @param code - Verification code
 * @returns Promise resolving to a boolean indicating success
 */
export const verifyEmailCode = async (
  _firestore: firebase.firestore.Firestore,
  verificationId: string,
  code: string
): Promise<boolean> => {
  try {
    // Call the enterprise-grade API service
    return await PreAuthService.verifyCode(verificationId, code);
  } catch (error) {
    // Proper error handling and propagation
    console.error('Error in verifyEmailCode:', error);
    throw error;
  }
};

/**
 * Creates a verified user account in Firebase Auth and Firestore
 * This implementation uses a secure approach that ensures data consistency
 * 
 * @param auth - Firebase Auth instance
 * @param firestore - Firebase Firestore instance
 * @param verificationId - Verification ID
 * @param password - Password for the new account
 * @param userData - Additional user data
 * @returns Promise resolving to the user ID
 */
export const createVerifiedUser = async (
  auth: firebase.auth.Auth,
  db: firebase.firestore.Firestore,
  verificationId: string,
  password: string,
  userData?: any
): Promise<string> => {
  try {
    // 1. Get the verified email from the verification record
    const verificationRef = db.collection('preVerificationCodes').doc(verificationId);
    const verificationDoc = await verificationRef.get();
    
    if (!verificationDoc.exists) {
      throw new Error('Verification record not found. Please restart the signup process.');
    }
    
    const verificationData = verificationDoc.data();
    if (!verificationData || !verificationData.verified) {
      throw new Error('Email verification status is invalid. Please verify your email first.');
    }
    
    const { email, userType } = verificationData;
    
    // 2. Create the Firebase Auth user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('Failed to create user account. Please try again.');
    }
    
    // 3. Create user documents in a transaction to ensure data consistency
    const userId = userCredential.user.uid;
    const batch = db.batch();
    
    // Create base user document
    const userRef = db.collection('users').doc(userId);
    const now = firebase.firestore.FieldValue.serverTimestamp();
    batch.set(userRef, {
      email,
      userType,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      profileComplete: true,
      lastLogin: now,
      metadata: {
        createdBy: 'signup_process',
        updatedBy: 'signup_process',
        environment: process.env.NODE_ENV || 'development'
      }
    });
    
    // Create specialized record based on user type
    if (userType === 'subscriber' || userType === UserType.SUBSCRIBER) {
      // Create subscriber record
      const subscriberRef = db.collection('subscribers').doc(userId);
      batch.set(subscriberRef, {
        userId,
        name: userData?.name || '',
        subscriptionAmount: userData?.subscriptionAmount || 10,
        tier: userData?.subscriptionAmount <= 5 ? 'basic' : 
              userData?.subscriptionAmount <= 15 ? 'standard' : 'premium',
        status: 'active',
        stripeId: null,
        startDate: now,
        paymentHistory: [],
        createdAt: now,
        updatedAt: now,
        metadata: {
          createdBy: 'signup_process',
          updatedBy: 'signup_process'
        }
      });
    } else if (userType === 'applicant' || userType === UserType.APPLICANT) {
      // Create applicant record
      const applicantRef = db.collection('applicants').doc(userId);
      batch.set(applicantRef, {
        userId,
        name: userData?.name || '',
        status: 'pending',
        applicationDate: now,
        documents: [],
        assistanceHistory: [],
        createdAt: now,
        updatedAt: now,
        metadata: {
          createdBy: 'signup_process',
          updatedBy: 'signup_process'
        }
      });
    }
    
    // Delete the verification record to prevent reuse
    batch.delete(verificationRef);
    
    // Commit all changes atomically
    await batch.commit();
    
    return userId;
  } catch (error) {
    // Proper error handling with meaningful messages
    console.error('Error creating verified user:', error);
    
    if (error instanceof Error) {
      // Preserve specific error messages
      throw error;
    }
    
    throw new Error('Failed to create account due to an unexpected error. Please try again.');
  }
};

/**
 * Resends a verification code
 * This delegates to our enterprise-grade API service
 * 
 * @param firestore - Firebase Firestore instance (unused, kept for backwards compatibility)
 * @param verificationId - Old verification ID (unused, we'll generate a new one for security)
 * @param email - User email (required to request a new code)
 * @returns Promise resolving to the new verification code (only in DEV)
 */
export const resendPreVerificationCode = async (
  _firestore: firebase.firestore.Firestore,
  _verificationId: string,
  email: string,
  userType: UserType = UserType.SUBSCRIBER
): Promise<string> => {
  try {
    // Request a completely new code via our secure API
    // This adds another layer of security by invalidating the old code
    await PreAuthService.sendVerificationCode(email, userType);
    
    // For development only - return a placeholder
    return __DEV__ ? '000000' : '';
  } catch (error) {
    // Proper error handling and propagation
    console.error('Error resending verification code:', error);
    throw error;
  }
};
