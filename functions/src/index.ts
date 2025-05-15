import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import * as handlebars from "handlebars";
import * as dotenv from "dotenv";

// Import public authentication functions
import { sendPreAuthVerificationCode, verifyPreAuthCode } from './public-auth';

// Load environment variables from .env file
dotenv.config();

// Define email template types
type EmailTemplate = "verification" | "passwordReset";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Email templates - in a production environment, these would be stored in separate files
const EMAIL_TEMPLATES = {
  verification: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #000000;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: #000000;
          font-size: 24px;
          margin: 0;
          padding: 0;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #000000;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #757575;
          font-size: 12px;
          padding: 20px 0;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/benzaid32/the-assist-app/main/src/assets/images/logo.png" alt="The Assist App" class="logo">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hello {{name}},</p>
          <p>Thank you for signing up with The Assist App. To complete your registration, please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="{{verificationLink}}" class="button">Verify Email</a>
          </p>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; {{year}} The Assist App. All rights reserved.</p>
          <p><a href="mailto:support@theassistapp.org" style="color: #404040; text-decoration: none;">support@theassistapp.org</a></p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #000000;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: #000000;
          font-size: 24px;
          margin: 0;
          padding: 0;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #000000;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #757575;
          font-size: 12px;
          padding: 20px 0;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/benzaid32/the-assist-app/main/src/assets/images/logo.png" alt="The Assist App" class="logo">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password for your account with The Assist App. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <p style="text-align: center;">
            <a href="{{resetLink}}" class="button">Reset Password</a>
          </p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p>{{resetLink}}</p>
        </div>
        <div class="footer">
          <p>&copy; {{year}} The Assist App. All rights reserved.</p>
          <p><a href="mailto:support@theassistapp.org" style="color: #404040; text-decoration: none;">support@theassistapp.org</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Initialize Resend with API key from environment variables
const initializeResend = () => {
  try {
    // Check for API key in environment variables or Firebase config
    let apiKey: string | undefined;
    
    // For production environment (Firebase)
    if (functions.config().resend?.api_key) {
      apiKey = functions.config().resend.api_key;
    } else {
      // For local development (.env file)
      apiKey = process.env.RESEND_API_KEY;
    }

    if (!apiKey) {
      throw new Error("Resend API key not found in environment variables or Firebase config");
    }

    return new Resend(apiKey);
  } catch (error) {
    functions.logger.error("Error initializing Resend:", error);
    throw new Error("Failed to initialize email service");
  }
};

// Helper function to compile email templates
const compileTemplate = (templateName: keyof typeof EMAIL_TEMPLATES,
  data: Record<string, unknown>) => {
  const template = handlebars.compile(EMAIL_TEMPLATES[templateName]);
  return template({
    ...data,
    year: new Date().getFullYear(),
  });
};

// Helper function to send emails using Resend
const sendEmail = async (
  to: string,
  subject: string,
  template: EmailTemplate,
  data: Record<string, unknown>
) => {
  try {
    const resend = initializeResend();
    const html = compileTemplate(template, data);

    // Get from email from Firebase config or environment variables
    let fromEmail: string;
    
    // For production environment (Firebase)
    if (functions.config().email?.from) {
      fromEmail = functions.config().email.from;
    } else {
      // For local development (.env file)
      fromEmail = process.env.FROM_EMAIL || "noreply@theassistapp.org";
    }
    
    const response = await resend.emails.send({
      from: `The Assist App <${fromEmail}>`,
      to,
      subject,
      html,
    });

    // Log successful email delivery
    functions.logger.info("Email sent with Resend:", response);

    return response;
  } catch (error) {
    functions.logger.error("Error sending email with Resend:", error);
    throw new Error("Failed to send email");
  }
};

// Function to send a verification code email
// Export the public auth endpoints
export { sendPreAuthVerificationCode, verifyPreAuthCode };

// Legacy function for authenticated users - now deprecated for pre-auth
// This is kept for backward compatibility with existing users
export const sendVerificationCode = functions.https.onCall(async (data: Record<string, unknown>, context: functions.https.CallableContext) => {
  try {
    // Validate input data
    const { email, code } = data;
    
    if (!email || typeof email !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email is required"
      );
    }
    
    if (!code || typeof code !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Verification code is required"
      );
    }
    
    // Create a custom email template for verification code
    const verificationCodeTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your Verification Code</title>
      <style>
        body {
          font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #000000;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: #000000;
          font-size: 24px;
          margin: 0;
          padding: 0;
        }
        .content {
          padding: 20px 0;
        }
        .verification-code {
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
          margin: 30px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          color: #757575;
          font-size: 12px;
          padding: 20px 0;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/benzaid32/the-assist-app/main/src/assets/images/logo.png" alt="The Assist App" class="logo">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for signing up with The Assist App. To complete your registration, please use the verification code below:</p>
          <div class="verification-code">${code}</div>
          <p>This code will expire in 30 minutes.</p>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} The Assist App. All rights reserved.</p>
          <p><a href="mailto:support@theassistapp.org" style="color: #404040; text-decoration: none;">support@theassistapp.org</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    // Initialize Resend for email delivery
    const resend = initializeResend();
    
    // Send the email with the verification code
    await resend.emails.send({
      from: "The Assist App <verification@theassistapp.org>",
      to: email,
      subject: "Your Verification Code - The Assist App",
      html: verificationCodeTemplate,
    });
    
    // Log the action for auditing
    functions.logger.info(`Verification code email sent to ${email}`);
    
    return { success: true, message: "Verification code sent successfully" };
  } catch (error) {
    functions.logger.error("Error sending verification code:", error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      "internal",
      "Failed to send verification code",
      { message: (error as Error).message }
    );
  }
});

// Function to send a custom verification email
export const sendVerificationEmail = functions.https.onCall(async (data: Record<string, unknown>, context: functions.https.CallableContext) => {
  try {
    // Security check - user must be authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send verification email"
      );
    }

    const { uid } = context.auth;
    const user = await admin.auth().getUser(uid);

    if (!user.email) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "User does not have an email address"
      );
    }

    if (user.emailVerified) {
      throw new functions.https.HttpsError(
        "already-exists",
        "Email is already verified"
      );
    }

    // Rate limiting - check if a verification email was sent recently
    // In a production app, implement proper rate limiting using Firestore or Redis

    // Generate a verification link
    // Get the app URL from Firebase config, environment variables, or use default
    let appUrl: string;
    
    // Check if data.appUrl is provided
    if (data.appUrl && typeof data.appUrl === 'string') {
      appUrl = data.appUrl;
    } 
    // For production environment (Firebase)
    else if (functions.config().app?.verification_url) {
      appUrl = functions.config().app.verification_url;
    } 
    // For local development (.env file)
    else {
      appUrl = process.env.VERIFICATION_REDIRECT_URL || "https://theassistapp.org";
    }
    
    // Ensure we have a valid URL format
    const verificationUrl = appUrl.toString().endsWith("/") 
      ? `${appUrl}verify-email?uid=${uid}` 
      : `${appUrl}/verify-email?uid=${uid}`;
    
    const actionCodeSettings = {
      url: verificationUrl,
      handleCodeInApp: true,
    };

    const verificationLink = await admin.auth().generateEmailVerificationLink(
      user.email,
      actionCodeSettings
    );

    // Send the custom email
    await sendEmail(
      user.email,
      "Verify Your Email - The Assist App",
      "verification",
      { verificationLink }
    );

    // Log the action for auditing
    functions.logger.info(`Verification email sent to ${user.email} (${uid})`);

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    functions.logger.error("Error sending verification email:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      "Failed to send verification email",
      { message: (error as Error).message }
    );
  }
});

// Function to send a custom password reset email
export const sendPasswordResetEmail = functions.https.onCall(async (data: Record<string, unknown>, _context: functions.https.CallableContext) => {
  try {
    // This function doesn't require authentication since users might be locked out
    const { email } = data;

    if (!email || typeof email !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email is required"
      );
    }

    // Check if the user exists
    try {
      await admin.auth().getUserByEmail(email);
    } catch (error) {
      // Don't reveal if the email exists for security reasons
      return { success: true, message: "If the email exists, a reset link has been sent" };
    }

    // Generate a password reset link
    const appUrl = data.appUrl || "https://theassistapp.com";
    const actionCodeSettings = {
      url: `${appUrl}/reset-password`,
      handleCodeInApp: true,
    };

    const resetLink = await admin.auth().generatePasswordResetLink(
      email,
      actionCodeSettings
    );

    // Send the custom email
    await sendEmail(
      email,
      "Reset Your Password - The Assist App",
      "passwordReset",
      { resetLink }
    );

    // Log the action for auditing
    functions.logger.info(`Password reset email sent to ${email}`);

    return { success: true, message: "Password reset email sent successfully" };
  } catch (error) {
    functions.logger.error("Error sending password reset email:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      "Failed to send password reset email",
      { message: (error as Error).message }
    );
  }
});

// Trigger function to send welcome email when a new user signs up
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  try {
    if (!user.email) {
      functions.logger.warn("New user has no email address, skipping welcome email");
      return;
    }

    // In a production app, you would have a welcome email template
    // For now, we'll just log that we would send a welcome email
    functions.logger.info(`Would send welcome email to ${user.email} (${user.uid})`);

    // In the future, implement a welcome email template and send it here

    return { success: true };
  } catch (error) {
    functions.logger.error("Error sending welcome email:", error);
    return { success: false, error: (error as Error).message };
  }
});
