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
    const user = await getUserData(firestore, userCredential.user.uid);
    
    if (!user) {
      throw new Error('User data not found after sign-in');
    }
    
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase(); 
      if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/invalid-email')) {
        throw new Error('No account found with this email. Please check your email or sign up.');
      } else if (errorMessage.includes('auth/wrong-password')) {
        throw new Error('Incorrect password. Please try again.');
      } else if (errorMessage.includes('auth/too-many-requests')) {
        throw new Error('Too many failed login attempts. Please try again later or reset your password.');
      } else if (errorMessage.includes('auth/network-request-failed')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
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
    
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('Account created but no user was returned');
    }
    const { uid } = userCredential.user;
    
    const userData: User = {
      userId: uid,
      email,
      userType,
      createdAt: new Date(), 
      profileCompleted: false
    };
    
    await firestore.collection('users').doc(uid).set({
      ...userData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp() 
    });
    
    return userData;
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
