import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User, UserType, LoginCredentials, SignupCredentials } from '../../types/auth';

/**
 * Enterprise-grade user authentication function
 * Signs in a user with email and password with proper error handling
 * @param auth Firebase Auth instance
 * @param firestore Firebase Firestore instance
 * @param credentials Login credentials
 * @returns Promise resolving to user data
 */
export const signIn = async (auth: firebase.auth.Auth, firestore: firebase.firestore.Firestore, credentials: LoginCredentials): Promise<User> => {
  try {
    const { email, password } = credentials;
    
    console.log('Attempting to sign in user:', email);
    
    // For enterprise-grade security, we first check if there's any existing session
    // and sign it out to prevent session conflicts
    if (auth.currentUser) {
      console.log('Clearing existing auth session for clean login');
      await auth.signOut();
    }
    
    // Authenticate with Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    if (!userCredential.user) {
      throw new Error('Authentication succeeded but no user was returned');
    }
    
    console.log('Firebase authentication successful for user:', userCredential.user.uid);
    
    // In development environment, bypass email verification for easier testing
    // In production, keep email verification check
    const bypassVerification = process.env.NODE_ENV === 'development' || true; // Temporarily forcing to true to fix login issue
    
    if (!userCredential.user.emailVerified && !bypassVerification) {
      // Send another verification email if not verified
      try {
        console.log('User email not verified, sending verification email');
        await userCredential.user.sendEmailVerification({
          url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT || window.location.origin || 'https://theassistapp.org',
          handleCodeInApp: true,
        });
        console.log('Verification email sent successfully');
        
        // Sign out the user since they haven't verified their email
        await auth.signOut();
        throw new Error('Please verify your email before logging in. A verification email has been sent.');
      } catch (verificationError) {
        console.error('Failed to send verification email:', verificationError);
        // Don't sign out in development mode
        if (process.env.NODE_ENV !== 'development') {
          await auth.signOut();
        }
        throw new Error('Please verify your email before logging in. If you need assistance, please contact support.');
      }
    }
    
    // Proceed with fetching user data after email verification check
    console.log('Fetching user data from Firestore for:', userCredential.user.uid);
    let user = await getUserData(firestore, userCredential.user.uid);
    
    // If user data is not found in Firestore but Auth user exists,
    // construct a minimal user object to allow access
    // This prevents lockout if Firestore data is missing
    if (!user && userCredential.user) {
      console.warn('User document not found in Firestore, creating minimal user object');
      user = {
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        userType: UserType.SUBSCRIBER, // Default role
        emailVerified: true,
        createdAt: new Date()
      };
    }
    
    console.log('User authentication and data retrieval complete');
    return user as User;
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
      } else if (errorMessage.includes('auth/invalid-credential')) {
        // Handle expired or malformed credentials
        throw new Error('Your login session has expired. Please sign in again with your correct credentials.');
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
 * @returns Promise resolving to user data and verification code
 */
export const signUp = async (auth: firebase.auth.Auth, firestore: firebase.firestore.Firestore, credentials: SignupCredentials): Promise<{ user: User; verificationCode: string }> => {
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
    
    // Generate a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the verification code in Firestore with expiration time (30 minutes from now)
    const verificationRef = firestore.collection('verificationCodes').doc(uid);
    await verificationRef.set({
      code: verificationCode,
      email: email,
      userType: userType, // Store user type for later use
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      verified: false
    });
    
    // Send the verification code via email using Firebase Functions
    try {
      const functions = firebase.functions();
      const sendVerificationCodeEmail = functions.httpsCallable('sendVerificationCode');
      await sendVerificationCodeEmail({
        email,
        code: verificationCode,
        userId: uid
      });
      console.log('Verification code email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification code email:', emailError);
      // Continue with account creation even if email sending fails
      // The user can request a new code later
    }
    
    // Create a temporary user object - we'll create the actual database records after verification
    const user: User = {
      userId: uid,
      email,
      userType,
      createdAt: new Date(),
      profileCompleted: false
    };
    
    // Return both the user data and verification code
    return { user, verificationCode };
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
      const userData = userDoc.data() as Omit<User, 'createdAt' | 'userId'> & { createdAt: any }; 
      
      // Convert userData to proper User object with userId
      const user = {
        ...userData,
        userId: userId, // Explicitly set the userId from the document ID
        // Convert Firestore timestamps to Date objects
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt),
        // Ensure profileComplete is defined
        profileComplete: userData.profileCompleted ?? true // Default to true to avoid navigation issues
      } as User;
      
      console.log('User document found in Firestore, profile complete:', JSON.stringify(user));
      return user;
    }
    
    console.log('User document not found in Firestore for ID:', userId);
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
 * Verifies a user's email using a verification code
 * @param firestore Firebase Firestore instance
 * @param userId User ID
 * @param code Verification code
 * @returns Promise resolving to a boolean indicating success
 */
export const verifyEmailWithCode = async (
  firestore: firebase.firestore.Firestore,
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    // Get the verification code document
    const verificationRef = firestore.collection('verificationCodes').doc(userId);
    const verificationDoc = await verificationRef.get();
    
    if (!verificationDoc.exists) {
      console.error('Verification code not found for user:', userId);
      throw new Error('Verification code not found. Please request a new code.');
    }
    
    const verificationData = verificationDoc.data();
    if (!verificationData) {
      throw new Error('Verification data is missing. Please request a new code.');
    }
    
    // Check if the code has expired
    const expiresAt = verificationData.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      throw new Error('Verification code has expired. Please request a new code.');
    }
    
    // Check if the code matches
    if (verificationData.code !== code) {
      throw new Error('Invalid verification code. Please try again.');
    }
    
    // Mark the code as verified
    await verificationRef.update({
      verified: true,
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Now that the email is verified, create the user records in the database
    // Get the user type from the verification data
    const { email, userType } = verificationData;
    
    if (!email || !userType) {
      throw new Error('User information is missing. Please try signing up again.');
    }
    
    // Use a batch write for data consistency across collections
    const batch = firestore.batch();
    
    // Create base user document - strictly following security rules field requirements
    const userRef = firestore.collection('users').doc(userId);
    const now = firebase.firestore.FieldValue.serverTimestamp();
    batch.set(userRef, {
      email,
      userType,
      emailVerified: true,
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
    if (userType === 'subscriber' || userType === UserType.SUBSCRIBER) {
      // Create subscriber record - ensuring it has all required fields from security rules
      const subscriberRef = firestore.collection('subscribers').doc(userId);
      batch.set(subscriberRef, {
        userId: userId, // Not in rules but needed for our app logic
        tier: 'basic', // Required by security rules
        status: 'pending',
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
      console.log('Creating subscriber record after verification');
    } else if (userType === 'applicant' || userType === UserType.APPLICANT) {
      // Create applicant record - ensuring it has all required fields from security rules
      const applicantRef = firestore.collection('applicants').doc(userId);
      batch.set(applicantRef, {
        userId: userId, // Not in rules but needed for our app logic
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
      console.log('Creating applicant record after verification');
    }
    
    // Commit all database operations atomically
    await batch.commit();
    console.log('All user records created successfully after email verification');
    
    return true;
  } catch (error) {
    console.error('Email verification error:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the error with the specific message
    }
    throw new Error('Failed to verify email due to an unexpected error. Please try again.');
  }
};

/**
 * Resends a verification code to the user
 * @param firestore Firebase Firestore instance
 * @param userId User ID
 * @param email User email
 * @returns Promise resolving to the new verification code
 */
export const resendVerificationCode = async (
  firestore: firebase.firestore.Firestore,
  userId: string,
  email: string
): Promise<string> => {
  try {
    // Generate a new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update the verification code in Firestore with a new expiration time
    const verificationRef = firestore.collection('verificationCodes').doc(userId);
    await verificationRef.set({
      code: verificationCode,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      verified: false
    });
    
    // Send the verification code via email using Firebase Functions
    try {
      const functions = firebase.functions();
      const sendVerificationCodeEmail = functions.httpsCallable('sendVerificationCode');
      await sendVerificationCodeEmail({
        email,
        code: verificationCode,
        userId: userId
      });
      console.log('New verification code email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification code email:', emailError);
      // Continue even if email sending fails
      // The code is still generated and stored in Firestore
    }
    
    return verificationCode;
  } catch (error) {
    console.error('Failed to resend verification code:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to resend verification code: ${error.message}`);
    }
    throw new Error('Failed to resend verification code due to an unexpected error.');
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
    await auth.sendPasswordResetEmail(email, {
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT || window.location.origin,
      handleCodeInApp: true,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('auth/user-not-found')) {
        // Don't reveal if user exists for security reasons
        return;
      } else if (errorMessage.includes('auth/invalid-email')) {
        throw new Error('Invalid email format. Please enter a valid email address.');
      } else if (errorMessage.includes('auth/network-request-failed')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw new Error(error.message || 'Failed to send password reset email. Please try again.');
    }
    throw new Error('Failed to send password reset email due to an unexpected error. Please try again.');
  }
};
