// Type declarations for external modules
declare module 'entities/decode';

// Email template types
declare type EmailTemplate = "verification" | "passwordReset";

// Resend email data structure
declare interface ResendEmailData {
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
declare interface ResendAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

// Response structure for email functions
declare interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
  id?: string;
}

// User types for the application
declare interface UserRole {
  subscriber?: boolean;
  applicant?: boolean;
  admin?: boolean;
}

// Email verification request data
declare interface VerificationEmailRequest {
  appUrl?: string;
}

// Password reset request data
declare interface PasswordResetRequest {
  email: string;
  appUrl?: string;
}
