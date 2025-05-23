import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';
import { getUserData, signIn, signUp, signOut, resetPassword } from '../services/firebase/auth';
import { sendVerificationEmail as sendVerificationEmailFn, sendPasswordResetEmail as sendPasswordResetEmailFn } from '../services/firebase/emailFunctions';
import { AuthState, User, LoginCredentials, SignupCredentials, UserType } from '../types/auth';
import { logError, logInfo } from '../services/logging';

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  isLoading: true, 
  error: null,
  isAuthenticated: false,
};

// Create context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: () => boolean;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
  auth: firebase.auth.Auth; 
  firestore: firebase.firestore.Firestore; 
}

/**
 * Auth provider component to manage authentication state
 */
export const AuthProvider = ({ children, auth, firestore }: AuthProviderProps) => { 
  const [state, setState] = useState<AuthState>(initialAuthState);

  // Clear any error messages
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Handle login
  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await signIn(auth, firestore, credentials); 
      setState(prev => ({ 
        ...prev,
        user, 
        isAuthenticated: true,
        isLoading: false,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      throw error;
    }
  };


  // Handle logout 
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await signOut(auth); 
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      throw error;
    }
  };

  // Handle password reset using Cloud Function
  const sendPasswordReset = async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get Firebase Functions instance
      const functions = firebase.functions();
      
      // Call the Cloud Function to send password reset email
      await sendPasswordResetEmailFn(functions, email);
      
      logInfo('Password reset email sent successfully');
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      logError('Failed to send password reset email', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      throw error;
    }
  };
  
  // Send verification email to current user using Cloud Function
  const sendVerificationEmail = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get Firebase Functions instance
      const functions = firebase.functions();
      
      // Call the Cloud Function to send verification email
      await sendVerificationEmailFn(functions);
      
      logInfo('Verification email sent successfully');
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      logError('Failed to send verification email', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      throw error;
    }
  };
  
  // Check if current user's email is verified
  const isEmailVerified = (): boolean => {
    return auth.currentUser?.emailVerified ?? false;
  };

  // Listen for auth state changes with enhanced error handling
  useEffect(() => {
    let isMounted = true;
    
    // Enterprise-grade auth state listener with proper error handling
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (!isMounted) return; 
        
        // Set initial loading state
        setState(prev => ({ ...prev, isLoading: true }));
        
        if (firebaseUser) {
          try {
            console.log('Firebase user authenticated:', firebaseUser.uid);
            
            // Get user data from Firestore
            let userData = null;
            try {
              userData = await getUserData(firestore, firebaseUser.uid);
              console.log('User document found in Firestore, profile complete:', JSON.stringify(userData));
            } catch (userDataError) {
              console.error('Error fetching user data:', userDataError);
              // Continue with authentication even if user data fetch fails
            }
            
            // For enterprise-grade security, we consider user authenticated regardless of email verification state
            // This prevents the navigation state mismatch causing the RESET error
            const isEmailVerified = firebaseUser.emailVerified || process.env.NODE_ENV === 'development';
            
            if (isMounted) {
              // Create a properly typed user object following enterprise-grade standards
              const userObject: User = userData || {
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                userType: UserType.SUBSCRIBER, // Use enum value for type safety
                emailVerified: isEmailVerified,
                profileCompleted: false // Default for new users
              };
              
              setState({
                user: userObject,
                isAuthenticated: true, // User is always authenticated if Firebase Auth says so
                isLoading: false,
                error: null,
              });
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            const errorMessage = __DEV__ && error instanceof Error 
              ? `Failed to load user data: ${error.message}` 
              : 'Failed to load user data';
            if (isMounted) {
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: errorMessage,
              });
            }
          }
        } else {
          if (isMounted) {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Unexpected auth state change error:', error);
        if (isMounted) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'An unexpected authentication error occurred',
          });
        }
      }
    }, (error) => {
      console.error('Auth state change subscription error:', error);
      if (isMounted) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to monitor authentication state',
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [auth, firestore]); 

  // Context value
  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      sendPasswordReset,
      sendVerificationEmail,
      isEmailVerified,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns Auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
