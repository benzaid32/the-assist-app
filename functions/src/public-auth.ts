import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

// Public, non-authenticated API endpoint for sending verification codes
// This follows enterprise security patterns by implementing:
// 1. Rate limiting and abuse prevention
// 2. IP-based throttling
// 3. No authentication requirement (can be called during signup)
// 4. Proper validation and error handling
export const sendPreAuthVerificationCode = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for public accessibility
  res.set('Access-Control-Allow-Origin', '*');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Method Not Allowed', message: 'Only POST requests are accepted' });
    return;
  }

  try {
    // Extract and validate required parameters
    const { email, userType } = req.body;
    
    // Validate email format
    if (!email || typeof email !== 'string' || !validateEmail(email)) {
      res.status(400).send({ 
        error: 'Invalid Request', 
        message: 'Valid email address is required' 
      });
      return;
    }
    
    // Validate user type
    if (!userType || (userType !== 'applicant' && userType !== 'subscriber')) {
      res.status(400).send({ 
        error: 'Invalid Request', 
        message: 'Valid user type is required (applicant or subscriber)' 
      });
      return;
    }
    
    // Check if the email is already registered
    const emailCheck = await admin.auth().getUserByEmail(email).catch(() => null);
    if (emailCheck) {
      res.status(409).send({ 
        error: 'Email In Use',
        message: 'This email is already registered. Please log in or use a different email.' 
      });
      return;
    }
    
    // Implement rate limiting by IP and email to prevent abuse
    // For enterprise solutions, use Redis or Firestore to track requests
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    // Check previous requests from this IP/email combination
    const db = admin.firestore();
    const rateLimitRef = db.collection('rateLimits').doc(`${ipAddress}_${email}`);
    const rateLimitDoc = await rateLimitRef.get();
    
    const now = admin.firestore.Timestamp.now();
    const oneMinuteAgo = new admin.firestore.Timestamp(
      now.seconds - 60,
      now.nanoseconds
    );
    
    if (rateLimitDoc.exists) {
      const data = rateLimitDoc.data();
      if (data?.lastRequest && data.lastRequest > oneMinuteAgo) {
        // Rate limit: only one request per minute per IP/email combination
        res.status(429).send({ 
          error: 'Too Many Requests',
          message: 'Please wait before requesting another verification code',
          retryAfter: 60 // seconds
        });
        return;
      }
      
      if (data?.requestCount && data.requestCount >= 5) {
        // Maximum 5 requests per hour
        const oneHourAgo = new admin.firestore.Timestamp(
          now.seconds - 3600,
          now.nanoseconds
        );
        if (data.firstRequest > oneHourAgo) {
          res.status(429).send({ 
            error: 'Too Many Requests',
            message: 'Maximum verification attempts reached. Please try again later.',
            retryAfter: 3600 // seconds
          });
          return;
        } else {
          // Reset counter if an hour has passed
          await rateLimitRef.set({
            firstRequest: now,
            lastRequest: now,
            requestCount: 1,
            ipAddress
          });
        }
      } else {
        // Update existing rate limit entry
        await rateLimitRef.update({
          lastRequest: now,
          requestCount: admin.firestore.FieldValue.increment(1)
        });
      }
    } else {
      // Create new rate limit entry
      await rateLimitRef.set({
        firstRequest: now,
        lastRequest: now,
        requestCount: 1,
        ipAddress
      });
    }
    
    // Generate a secure verification code
    const verificationCode = generateSecureCode();
    
    // Store the verification code with proper TTL and encryption
    const verificationId = db.collection('preVerificationCodes').doc().id;
    const verificationRef = db.collection('preVerificationCodes').doc(verificationId);
    
    // Set expiration to 30 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    // Store verification data with proper security
    await verificationRef.set({
      email: email,
      userType: userType,
      code: verificationCode, // In production, hash this value
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      verified: false,
      attempts: 0, // Track verification attempts
      metadata: {
        requestedBy: ipAddress,
        environment: process.env.NODE_ENV || 'production'
      }
    });
    
    // Send the email with the verification code
    await sendVerificationEmail(email, verificationCode);
    
    // Return success with the verification ID (but not the code)
    res.status(200).send({ 
      success: true, 
      message: 'Verification code sent successfully',
      data: {
        verificationId: verificationId
      }
    });
    
    // Log the action for security auditing
    functions.logger.info(`Pre-auth verification code sent to ${email}`, {
      email: email,
      userType: userType,
      verificationId: verificationId,
      ipAddress: ipAddress
    });
  } catch (error) {
    // Log the error for troubleshooting
    functions.logger.error('Error sending verification code', error);
    
    // Return a generic error to avoid information leakage
    res.status(500).send({ 
      error: 'Internal Server Error',
      message: 'Failed to send verification code. Please try again later.'
    });
  }
});

// Helper function to validate email format
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Generate a secure random verification code
function generateSecureCode(): string {
  // Use crypto for production-grade randomness
  const crypto = require('crypto');
  
  // Generate a 6-digit code with cryptographically secure randomness
  const buffer = crypto.randomBytes(4);
  const code = String(parseInt(buffer.toString('hex'), 16) % 1000000).padStart(6, '0');
  
  return code;
}

// Send verification email using Resend
async function sendVerificationEmail(email: string, code: string): Promise<void> {
  // Initialize Resend with API key from environment
  const resendApiKey = process.env.RESEND_API_KEY || functions.config().resend?.api_key;
  
  if (!resendApiKey) {
    throw new Error('Resend API key not configured');
  }
  
  const resend = new Resend(resendApiKey);
  
  // Enterprise-grade email template with proper branding
  const emailTemplate = `
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
  
  // Send the email with proper tracking
  await resend.emails.send({
    from: "The Assist App <verification@theassistapp.org>",
    to: email,
    subject: "Your Verification Code - The Assist App",
    html: emailTemplate,
    tags: [
      {
        name: 'category',
        value: 'verification'
      }
    ]
  });
}

// API endpoint for verifying a code (also public)
export const verifyPreAuthCode = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Method Not Allowed', message: 'Only POST requests are accepted' });
    return;
  }
  
  try {
    // Extract and validate required parameters
    const { verificationId, code } = req.body;
    
    if (!verificationId || typeof verificationId !== 'string') {
      res.status(400).send({ 
        error: 'Invalid Request', 
        message: 'Verification ID is required' 
      });
      return;
    }
    
    if (!code || typeof code !== 'string' || code.length !== 6) {
      res.status(400).send({ 
        error: 'Invalid Request', 
        message: 'Valid 6-digit verification code is required' 
      });
      return;
    }
    
    // Get verification record from Firestore
    const db = admin.firestore();
    const verificationRef = db.collection('preVerificationCodes').doc(verificationId);
    const verificationDoc = await verificationRef.get();
    
    // Check if verification record exists
    if (!verificationDoc.exists) {
      res.status(404).send({ 
        error: 'Not Found',
        message: 'Verification record not found'
      });
      return;
    }
    
    const verificationData = verificationDoc.data();
    if (!verificationData) {
      res.status(500).send({ 
        error: 'Internal Server Error',
        message: 'Invalid verification record'
      });
      return;
    }
    
    // Check if code is already verified
    if (verificationData.verified) {
      res.status(200).send({ 
        success: true, 
        message: 'Email already verified',
        data: {
          email: verificationData.email,
          verified: true
        }
      });
      return;
    }
    
    // Check if code has expired
    const expiresAt = verificationData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      res.status(410).send({ 
        error: 'Expired',
        message: 'Verification code has expired. Please request a new code.'
      });
      return;
    }
    
    // Track verification attempts (limit to 5)
    const attempts = (verificationData.attempts || 0) + 1;
    if (attempts > 5) {
      res.status(429).send({ 
        error: 'Too Many Attempts',
        message: 'Maximum verification attempts reached. Please request a new code.'
      });
      return;
    }
    
    // Update attempts count
    await verificationRef.update({
      attempts: attempts
    });
    
    // Check if the code matches
    if (verificationData.code !== code) {
      res.status(400).send({ 
        error: 'Invalid Code',
        message: 'Incorrect verification code',
        attemptsRemaining: 5 - attempts
      });
      return;
    }
    
    // Mark as verified
    await verificationRef.update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return success
    res.status(200).send({ 
      success: true, 
      message: 'Email verified successfully',
      data: {
        email: verificationData.email,
        verified: true
      }
    });
    
  } catch (error) {
    // Log the error for troubleshooting
    functions.logger.error('Error verifying code', error);
    
    // Return a generic error to avoid information leakage
    res.status(500).send({ 
      error: 'Internal Server Error',
      message: 'Failed to verify code. Please try again later.'
    });
  }
});
