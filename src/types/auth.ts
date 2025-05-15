export enum UserType {
  SUBSCRIBER = 'subscriber',
  APPLICANT = 'applicant',
  ADMIN = 'admin',
}

/**
 * Enterprise-grade User interface with proper typing
 * Following best practices for optional fields and authentication state
 */
export interface User {
  userId: string;
  email: string | null;
  displayName?: string;
  userType: UserType | string; // Allow string for backward compatibility
  createdAt?: Date | any; // Using any for Firestore Timestamp compatibility
  profileCompleted?: boolean; // Optional for new users
  emailVerified?: boolean; // Added for auth state tracking
  metadata?: Record<string, any>; // For additional user metadata
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  userType: UserType;
}
