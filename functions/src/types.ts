/**
 * Enterprise-grade type definitions for the application
 */

// Available email templates
export type EmailTemplate = "verification" | "passwordReset";

// Resend email data structure
export interface ResendEmailData {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: ResendAttachment[];
}

// Resend attachment type
export interface ResendAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

// Response structure for email functions
export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
  id?: string;
}

// User types for the application
export interface UserRole {
  subscriber?: boolean;
  applicant?: boolean;
  admin?: boolean;
}

/**
 * UserType enum for strongly typed user types
 * Used throughout the application for consistent type checking
 */
export enum UserType {
  SUBSCRIBER = 'subscriber',
  APPLICANT = 'applicant',
  ADMIN = 'admin'
}

// Email verification request data
export interface VerificationEmailRequest {
  appUrl?: string;
}

// Password reset request data
export interface PasswordResetRequest {
  email: string;
  appUrl?: string;
}
