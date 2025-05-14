export enum UserType {
  SUBSCRIBER = 'subscriber',
  APPLICANT = 'applicant',
  ADMIN = 'admin',
}

export interface User {
  userId: string;
  email: string;
  displayName?: string;
  userType: UserType;
  createdAt: Date;
  profileCompleted: boolean;
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
