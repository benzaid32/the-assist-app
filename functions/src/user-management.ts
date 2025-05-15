import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { UserType } from "./types";

/**
 * Enterprise-grade user creation function
 * 
 * This follows the approach used by major tech companies:
 * 1. Secure server-side user creation with proper validation
 * 2. Transaction-based writes for data consistency
 * 3. Proper error handling and logging
 * 4. Security through Cloud Functions (avoiding client permission issues)
 */
export const createVerifiedUser = functions.https.onCall(async (data, context) => {
  try {
    const { verificationId, email, password, userType, userData } = data;
    
    if (!verificationId || !email || !password || !userType) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }
    
    // Validate the verification record exists and is verified
    const db = admin.firestore();
    const verificationRef = db.collection('preVerificationCodes').doc(verificationId);
    const verificationDoc = await verificationRef.get();
    
    if (!verificationDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Verification record not found"
      );
    }
    
    const verificationData = verificationDoc.data();
    if (!verificationData || !verificationData.verified) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Email verification is incomplete"
      );
    }
    
    // Verify the email matches
    if (verificationData.email !== email) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Email mismatch with verification record"
      );
    }
    
    // Create the user in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        emailVerified: true, // Mark as verified since we've already verified it
      });
    } catch (error: unknown) {
      // Handle Firebase Auth specific errors
      const authError = error as { code?: string; message?: string };
      
      if (authError.code === 'auth/email-already-exists') {
        throw new functions.https.HttpsError(
          "already-exists",
          "Email is already in use"
        );
      }
      
      functions.logger.error("Error creating user:", authError);
      throw new functions.https.HttpsError(
        "internal",
        authError.message || "Failed to create user account"
      );
    }
    
    const uid = userRecord.uid;
    
    // Create all user documents in a transaction
    try {
      await db.runTransaction(async (transaction) => {
        // Create base user document with proper schema
        const userRef = db.collection('users').doc(uid);
        
        const userDoc = {
          email: email,
          userType: userType,
          emailVerified: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          profileComplete: true,
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            createdBy: 'signup_process',
            updatedBy: 'signup_process',
            environment: process.env.NODE_ENV || 'production'
          }
        };
        
        transaction.set(userRef, userDoc);
        
        // Create type-specific user document
        if (userType === 'subscriber' || userType === UserType.SUBSCRIBER) {
          const subscriberRef = db.collection('subscribers').doc(uid);
          
          const subscriberDoc = {
            userId: uid,
            name: userData?.name || '',
            subscriptionAmount: userData?.subscriptionAmount || 10,
            tier: calculateTier(userData?.subscriptionAmount || 10),
            status: 'active',
            stripeId: null,
            startDate: admin.firestore.FieldValue.serverTimestamp(),
            paymentHistory: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
              createdBy: 'signup_process',
              updatedBy: 'signup_process'
            }
          };
          
          transaction.set(subscriberRef, subscriberDoc);
        } else if (userType === 'applicant' || userType === UserType.APPLICANT) {
          const applicantRef = db.collection('applicants').doc(uid);
          
          const applicantDoc = {
            userId: uid,
            name: userData?.name || '',
            status: 'pending',
            applicationDate: admin.firestore.FieldValue.serverTimestamp(),
            documents: [],
            assistanceHistory: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
              createdBy: 'signup_process',
              updatedBy: 'signup_process'
            }
          };
          
          transaction.set(applicantRef, applicantDoc);
        }
        
        // Delete the verification record to prevent reuse
        transaction.delete(verificationRef);
      });
      
      // Return success with the user ID
      return { 
        success: true, 
        userId: uid,
        message: "User account created successfully" 
      };
      
    } catch (error) {
      // Handle transaction errors
      functions.logger.error("Error creating user documents:", error);
      
      // Clean up: Delete the Auth user if Firestore failed
      try {
        await admin.auth().deleteUser(uid);
      } catch (deleteError) {
        functions.logger.error("Failed to delete user after transaction error:", deleteError);
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create user records"
      );
    }
    
  } catch (error) {
    functions.logger.error("User creation error:", error);
    
    // Re-throw HttpsError as is
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Convert other errors to HttpsError
    const typedError = error as { message?: string };
    throw new functions.https.HttpsError(
      "unknown",
      typedError.message || "An unknown error occurred"
    );
  }
});

/**
 * Calculate subscription tier based on amount
 * @param amount Subscription amount
 */
function calculateTier(amount: number): string {
  if (amount <= 5) return 'basic';
  if (amount <= 15) return 'standard';
  return 'premium';
}

