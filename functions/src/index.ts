import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import * as handlebars from "handlebars";
import * as dotenv from "dotenv";

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
      <title>Verify Your Email - The Assist App</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #000000;
          background-color: #FFFFFF;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .logo {
          max-width: 150px;
        }
        .content {
          background-color: #FFFFFF;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #FF5A5F;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #FF5A5F;
          color: #FFFFFF;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://firebasestorage.googleapis.com/v0/b/assist-app-6c044.appspot.com/o/public%2Flogo.png?alt=media" alt="The Assist App" class="logo">
        </div>
        <div class="content">
          <h1>Verify Your Email Address</h1>
          <p>Thank you for signing up with The Assist App. To complete your registration and access all features, please verify your email address.</p>
          <p>This helps us ensure the security of your account and keep you informed about important updates.</p>
          <p><a href="{{verificationLink}}" class="button">Verify Email Address</a></p>
          <p>If you didn't create an account with The Assist App, you can safely ignore this email.</p>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p>{{verificationLink}}</p>
        </div>
        <div class="footer">
          <p>&copy; {{year}} The Assist App. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
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
      <title>Reset Your Password - The Assist App</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #000000;
          background-color: #FFFFFF;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .logo {
          max-width: 150px;
        }
        .content {
          background-color: #FFFFFF;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #FF5A5F;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #FF5A5F;
          color: #FFFFFF;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://firebasestorage.googleapis.com/v0/b/assist-app-6c044.appspot.com/o/public%2Flogo.png?alt=media" alt="The Assist App" class="logo">
        </div>
        <div class="content">
          <h1>Reset Your Password</h1>
          <p>We received a request to reset your password for The Assist App. Click the button below to create a new password.</p>
          <p><a href="{{resetLink}}" class="button">Reset Password</a></p>
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p>{{resetLink}}</p>
        </div>
        <div class="footer">
          <p>&copy; {{year}} The Assist App. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Initialize Resend with API key from environment variables
const initializeResend = () => {
  try {
    // Get API key from environment variables
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("Missing Resend API key. Set RESEND_API_KEY in .env file");
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

    const response = await resend.emails.send({
      from: "The Assist App <noreply@theassistapp.org>",
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
    const appUrl = data.appUrl || "https://theassistapp.com";
    const actionCodeSettings = {
      url: `${appUrl}/verify-email?uid=${uid}`,
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
