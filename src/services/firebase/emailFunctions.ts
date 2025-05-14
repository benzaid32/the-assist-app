import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import { logError } from '../logging';

/**
 * Service for interacting with Firebase Cloud Functions related to email operations
 */

/**
 * Sends a verification email to the currently signed in user
 * @param functions Firebase Functions instance
 * @returns Promise resolving to the result of the function call
 */
export const sendVerificationEmail = async (functions: firebase.functions.Functions): Promise<void> => {
  try {
    // Get the current app URL for verification redirect
    const appUrl = window.location.origin;
    
    // Call the Firebase Cloud Function
    const sendVerificationEmailFn = functions.httpsCallable('sendVerificationEmail');
    const result = await sendVerificationEmailFn({ appUrl });
    
    if (!result.data.success) {
      throw new Error(result.data.message || 'Failed to send verification email');
    }
    
    return;
  } catch (error) {
    logError('Failed to send verification email', error);
    
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('too-many-requests')) {
        throw new Error('Too many verification emails sent recently. Please try again later.');
      }
      throw new Error(error.message || 'Failed to send verification email. Please try again later.');
    }
    
    throw new Error('Failed to send verification email due to an unexpected error.');
  }
};

/**
 * Sends a password reset email to the specified email address
 * @param functions Firebase Functions instance
 * @param email User email
 * @returns Promise resolving to the result of the function call
 */
export const sendPasswordResetEmail = async (functions: firebase.functions.Functions, email: string): Promise<void> => {
  try {
    // Get the current app URL for reset redirect
    const appUrl = window.location.origin;
    
    // Call the Firebase Cloud Function
    const sendPasswordResetEmailFn = functions.httpsCallable('sendPasswordResetEmail');
    const result = await sendPasswordResetEmailFn({ email, appUrl });
    
    if (!result.data.success) {
      throw new Error(result.data.message || 'Failed to send password reset email');
    }
    
    return;
  } catch (error) {
    logError('Failed to send password reset email', error);
    
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to send password reset email. Please try again later.');
    }
    
    throw new Error('Failed to send password reset email due to an unexpected error.');
  }
};
