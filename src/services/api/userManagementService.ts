import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import { UserType } from '../../types/auth';

/**
 * Enterprise-grade user management service
 * 
 * This service follows industry best practices used by major tech companies:
 * 1. Clear separation of concerns
 * 2. Proper type definitions
 * 3. Enterprise-grade error handling
 * 4. Robust security patterns
 */
export class UserManagementService {
  /**
   * Creates a verified user through secure Cloud Functions
   * @param verificationId - Verification ID from the email verification process
   * @param email - User's email address
   * @param password - User's password
   * @param userType - User type (subscriber or applicant)
   * @param userData - Additional user data
   * @returns Promise resolving to the created user ID
   */
  public static async createVerifiedUser(
    verificationId: string,
    email: string,
    password: string,
    userType: UserType,
    userData?: any
  ): Promise<string> {
    try {
      // Get Firebase Functions instance
      const functions = firebase.functions();
      
      // Call the secure Cloud Function to create the user
      const createUser = functions.httpsCallable('createVerifiedUser');
      
      // Make the secure call
      const result = await createUser({
        verificationId,
        email,
        password,
        userType,
        userData
      });
      
      // Check for success and return the user ID
      if (result.data && result.data.success && result.data.userId) {
        console.log('User created successfully:', result.data.message);
        return result.data.userId;
      } else {
        throw new Error('Failed to create user account');
      }
    } catch (error) {
      console.error('Error creating verified user:', error);
      
      // Parse the error from Cloud Functions
      if (error.code === 'functions/invalid-argument') {
        throw new Error('Missing required information for signup');
      } else if (error.code === 'functions/already-exists') {
        throw new Error('This email is already in use');
      } else if (error.code === 'functions/permission-denied') {
        throw new Error('Email verification failed');
      } else if (error.code === 'functions/not-found') {
        throw new Error('Verification record not found');
      } else if (error.code === 'functions/failed-precondition') {
        throw new Error('Email verification is incomplete');
      }
      
      // Default error message
      throw new Error(error.message || 'Failed to create account');
    }
  }
}
