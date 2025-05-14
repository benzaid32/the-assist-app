import { ValidationErrors } from './FormController';

/**
 * Validation rules for form fields
 * Follows enterprise-grade patterns for validation
 */

// Email validation with proper regex pattern
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Password strength validation
export const isStrongPassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase, one lowercase and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validation factory for auth forms
 * Follows single responsibility principle - each validator does one thing well
 */

// Login form validator
export const validateLoginForm = (values: { email: string; password: string }): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return errors;
};

// Signup form validator with more complex rules
export const validateSignupForm = (values: { 
  email: string; 
  password: string; 
  confirmPassword: string;
  userType: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (!isStrongPassword(values.password)) {
    errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and numbers';
  }
  
  // Confirm password validation
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // User type validation
  if (!values.userType) {
    errors.userType = 'Please select a user type';
  }
  
  return errors;
};

// Forgot password form validator
export const validateForgotPasswordForm = (values: { email: string }): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  return errors;
};
