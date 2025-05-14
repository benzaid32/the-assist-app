import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User, UserType, LoginCredentials, SignupCredentials } from '../../types/auth';

/**
 * Signs in a user with email and password
 * @param auth Firebase Auth instance
 * @param firestore Firebase Firestore instance
 * @param credentials Login credentials
 * @returns Promise resolving to user data
 */
export const signIn = async (auth: firebase.auth.Auth, firestore: firebase.firestore.Firestore, credentials: LoginCredentials): Promise<User> => {
  try {
    const { email, password } = credentials;
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('Authentication succeeded but no user was returned');
    }
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      // Send another verification email if not verified
      try {
        await userCredential.user.sendEmailVerification({
          url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT || window.location.origin,
          handleCodeInApp: true,
        });
        console.log('Verification email re-sent successfully');
        
        // Sign out the user since they haven't verified their email
        await auth.signOut();
        throw new Error('Please verify your email before logging in. A new verification email has been sent.');
      } catch (verificationError) {
        console.error('Failed to re-send verification email:', verificationError);
        await auth.signOut();
        throw new Error('Please verify your email before logging in. If you did not receive a verification email, please try again or contact support.');
      }
    }
    
    // Proceed with fetching user data after email verification check
    const user = await getUserData(firestore, userCredential.user.uid);
    
    if (!user) {
      throw new Error('User data not found after sign-in');
    }
    
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Handle specific Firebase auth errors
      if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/invalid-email')) {
        throw new Error('No account found with this email. Please check your email or sign up.');
      } else if (errorMessage.includes('auth/wrong-password')) {
        throw new Error('Incorrect password. Please try again.');
      } else if (errorMessage.includes('auth/too-many-requests')) {
        throw new Error('Too many failed login attempts. Please try again later or reset your password.');
      } else if (errorMessage.includes('auth/network-request-failed')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (errorMessage.includes('auth/email-not-verified') || errorMessage.includes('please verify your email')) {
        // Custom error for unverified email - maintain the original message
        throw error;
      }
      
      // Default error handling
      throw new Error(error.message || 'Sign in failed. Please try again.');
    }
    
    throw new Error('Failed to sign in due to an unexpected error. Please try again.');
  }
};

/**
 * Creates a new user account with email and password
 * @param auth Firebase Auth instance
 * @param firestore Firebase Firestore instance
 * @param credentials Signup credentials
 * @returns Promise resolving to user data
 */
export const signUp = async (auth: firebase.auth.Auth, firestore: firebase.firestore.Firestore, credentials: SignupCredentials): Promise<User> => {
  try {
    const { email, password, userType } = credentials;
    
    // Create Firebase auth user with email/password
    console.log(`Attempting to create user with email: ${email}`);
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('Account created but no user was returned');
    }
    const { uid } = userCredential.user;
    console.log(`User created successfully with ID: ${uid}`);
    
    // Send email verification
    try {
      await userCredential.user.sendEmailVerification({
        url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT || window.location.origin,
        handleCodeInApp: true,
      });
      console.log('Verification email sent successfully');
    } catch (verificationError) {
      console.error('Failed to send verification email:', verificationError);
      // Continue with account creation even if email verification fails
      // This prevents blocking user registration due to email service issues
    }
    
    // Use a batch write for data consistency across collections
    const batch = firestore.batch();
    
    // Create base user document - strictly following security rules field requirements
    const userRef = firestore.collection('users').doc(uid);
    const now = firebase.firestore.FieldValue.serverTimestamp();
    batch.set(userRef, {
      email,
      userType,
      createdAt: now,
      updatedAt: now,
      profileComplete: false,
      lastLogin: now,
      metadata: {
        createdBy: 'signup_process',
        updatedBy: 'signup_process',
        environment: process.env.NODE_ENV || 'development'
      }
    });
    
    // Create specialized record based on user type
    if (userType === 'subscriber') {
      // Create subscriber record - ensuring it has all required fields from security rules
      const subscriberRef = firestore.collection('subscribers').doc(uid);
      batch.set(subscriberRef, {
        userId: uid, // Not in rules but needed for our app logic
        tier: 'basic', // Required by security rules
        status: 'pending',
        stripeId: null,
        startDate: now,
        paymentHistory: [],
        metadata: {
          createdBy: 'signup_process',
          updatedBy: 'signup_process',
          environment: process.env.NODE_ENV || 'development'
        }
      });
      console.log('Created subscriber record');
    } else if (userType === 'applicant') {
      // Create applicant record - ensuring it has all required fields from security rules
      const applicantRef = firestore.collection('applicants').doc(uid);
      batch.set(applicantRef, {
        userId: uid, // Not in rules but needed for our app logic
        status: 'PENDING_REVIEW', // Required by security rules
        documents: [], // Required by security rules
        financialInfo: {
          requestAmount: 0,
          needType: 'unspecified'
        },
        verificationStatus: 'pending',
        metadata: {
          createdBy: 'signup_process',
          updatedBy: 'signup_process',
          environment: process.env.NODE_ENV || 'development'
        }
      });
      console.log('Created applicant record');
    }
    
    // Add detailed logging before commit
    console.log('About to commit batch with the following operations:');
    console.log('- Creating user document for:', uid);
    if (userType === 'subscriber') {
      console.log('- Creating subscriber record for:', uid);
    } else if (userType === 'applicant') {
      console.log('- Creating applicant record for:', uid);
    }
    
    // Commit all database operations atomically
    try {
      await batch.commit();
      console.log('All user records created successfully');
    } catch (batchError) {
      console.error('Batch commit failed with error:', batchError);
      if (batchError instanceof Error) {
        console.error('Error code:', (batchError as any).code);
        console.error('Error details:', (batchError as any).details);
      }
      throw batchError;
    }
    
    // Construct and return user data object
    const user: User = {
      userId: uid,
      email,
      userType,
      createdAt: new Date(),
      profileCompleted: false
    };
    
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('auth/email-already-in-use')) {
        throw new Error('This email is already in use. Please use a different email or sign in.');
      } else if (errorMessage.includes('auth/invalid-email')) {
        throw new Error('Invalid email format. Please enter a valid email address.');
      } else if (errorMessage.includes('auth/weak-password')) {
        throw new Error('Password is too weak. It should be at least 6 characters long.');
      } else if (errorMessage.includes('auth/network-request-failed')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw new Error(error.message || 'Sign up failed. Please try again.');
    }
    
    throw new Error('Failed to create account due to an unexpected error. Please try again.');
  }
};

/**
 * Signs out the current user
 * @param auth Firebase Auth instance
 */
export const signOut = async (auth: firebase.auth.Auth): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    if (error instanceof Error && error.message.includes('auth/network-request-failed')){
      throw new Error('Network error during sign out. Please check connection.');
    }
    throw new Error('Failed to sign out. Please try again.');
  }
};

/**
 * Gets user data from Firestore
 * @param firestore Firebase Firestore instance
 * @param userId User ID
 * @returns Promise resolving to user data
 */
export const getUserData = async (firestore: firebase.firestore.Firestore, userId: string): Promise<User | null> => {
  try {
    const userDocRef = firestore.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data() as Omit<User, 'createdAt'> & { createdAt: any }; 
      return {
        ...userData,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data from Firestore:', error);
    if (error instanceof Error && error.message.includes('firestore/unavailable')){
       throw new Error('Database is temporarily unavailable. Please try again later.');
    }
    throw new Error('Failed to retrieve user data. Please try again.');
  }
};

/**
 * Sends a password reset email
 * @param auth Firebase Auth instance
 * @param email User email
 */
/**
 * Resends verification email to the currently signed in user
 * @param auth Firebase Auth instance
 * @returns Promise resolving to void
 */
export const resendVerificationEmail = async (auth: firebase.auth.Auth): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    await currentUser.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT || window.location.origin,
      handleCodeInApp: true,
    });
    
    console.log('Verification email sent successfully');
    return;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('auth/too-many-requests')) {
        throw new Error('Too many verification emails sent recently. Please try again later.');
      }
      throw new Error(error.message || 'Failed to send verification email. Please try again later.');
    }
    
    throw new Error('Failed to send verification email due to an unexpected error.');
  }
};

/**
 * Sends a password reset email
 * @param auth Firebase Auth instance
 * @param email User email
 * @returns Promise resolving to void
 */
export const resetPassword = async (auth: firebase.auth.Auth, email: string): Promise<void> => {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    console.error('Password reset error:', error);
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/invalid-email')) {
        throw new Error('No account found with this email. Please check the email address.');
      } else if (errorMessage.includes('auth/too-many-requests')){
        throw new Error('Too many requests. Please try again later.');
      } else if (errorMessage.includes('auth/network-request-failed')){
        throw new Error('Network error. Please check your internet connection.');
      }
      throw new Error(error.message || 'Password reset failed. Please try again.');
    }
    throw new Error('Failed to send password reset email due to an unexpected error.');
  }
};
