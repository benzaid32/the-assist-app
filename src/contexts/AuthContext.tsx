import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getUserData, signIn, signUp, signOut, resetPassword } from '../services/firebase/auth';
import { AuthState, User, LoginCredentials, SignupCredentials } from '../types/auth';

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
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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

  // Handle signup
  const signup = async (credentials: SignupCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await signUp(auth, firestore, credentials); 
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

  // Handle password reset
  const sendPasswordReset = async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await resetPassword(auth, email); 
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      throw error;
    }
  };

  // Listen for auth state changes with enhanced error handling
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (!isMounted) return; 
        
        if (firebaseUser) {
          try {
            const userData = await getUserData(firestore, firebaseUser.uid);
            
            if (isMounted) {
              setState({
                user: userData,
                isAuthenticated: !!userData,
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
  const contextValue: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    sendPasswordReset,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
