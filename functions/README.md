# The Assist App - Firebase Cloud Functions

This directory contains the Firebase Cloud Functions for The Assist App, providing enterprise-grade email functionality and other backend services.

## Email Functions

The Cloud Functions in this directory handle all email-related operations for The Assist App, including:

1. **Email Verification** - Custom branded verification emails with secure links
2. **Password Reset** - Branded password reset emails with secure links
3. **Welcome Emails** - Automatically sent when new users sign up

## Features

- **Enterprise-Grade Security** - All email operations happen server-side to prevent tampering
- **Consistent Branding** - Custom HTML templates with The Assist App branding
- **Comprehensive Logging** - Detailed logs for monitoring and debugging
- **Error Handling** - Robust error handling with appropriate HTTP status codes
- **Rate Limiting** - Protection against abuse (to be implemented in production)
- **Reliable Delivery** - Uses Resend.com for high-deliverability email sending

## Setup and Deployment

### Prerequisites

- Node.js 18 or later
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project with Firestore and Authentication enabled
- Resend.com account for email delivery

### Setting Up Resend.com

1. Create a Resend.com account at [resend.com](https://resend.com)

2. Verify your domain for better deliverability:
   - Go to Domains in your Resend dashboard
   - Add your domain and follow the DNS verification steps
   - For testing, you can use the sandbox domain provided by Resend

3. Create an API key:
   - Go to API Keys in your Resend dashboard
   - Create a new API key with appropriate permissions
   - Copy the API key for the next step

4. Configure environment variables:
   - Create a `.env` file in the functions directory with your Resend API key and other required variables:
     ```
     # Resend API key for email operations
     RESEND_API_KEY=your_api_key_here
     
     # URL for email verification redirects
     VERIFICATION_REDIRECT_URL=https://theassistapp.org
     
     # Email addresses
     FROM_EMAIL=noreply@theassistapp.org
     SUPPORT_EMAIL=support@theassistapp.org
     ```
   - For production, set the environment variables in Firebase:
     ```bash
     # Set Resend API key
     firebase functions:config:set resend.api_key="your_api_key_here"
     
     # Set verification redirect URL
     firebase functions:config:set app.verification_url="https://theassistapp.org"
     
     # Set email addresses
     firebase functions:config:set email.from="noreply@theassistapp.org"
     firebase functions:config:set email.support="support@theassistapp.org"
     ```

### Local Development

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Set up local environment variables:
   ```bash
   firebase functions:config:get > .runtimeconfig.json
   ```

3. Start the Firebase emulators:
   ```bash
   firebase emulators:start
   ```

4. Test the functions locally:
   ```bash
   npm run serve
   ```

### Deployment

1. Set environment variables for production (if not already done):
   ```bash
   firebase functions:config:set resend.api_key="your_api_key_here"
   ```

2. Deploy the functions to Firebase:
   ```bash
   firebase deploy --only functions
   ```

3. Or deploy a specific function:
   ```bash
   firebase deploy --only functions:sendVerificationEmail
   ```

4. Verify deployment:
   ```bash
   firebase functions:log
   ```

## Email Templates

The email templates are currently defined inline in the code. In a production environment, consider:

1. Moving templates to separate HTML files
2. Using a template management system
3. Implementing internationalization for multiple languages

## Production Considerations

Before deploying to production, ensure these enterprise-grade practices are implemented:

### Email Delivery
1. **Resend.com Configuration**:
   - Use a verified custom domain for better deliverability and brand trust
   - Set up DMARC, SPF, and DKIM records for your domain
   - Monitor email delivery rates and engagement in the Resend dashboard

### Security
1. **API Key Management**:
   - Use Firebase environment variables for storing the Resend API key
   - Implement key rotation policies (rotate keys every 90 days)
   - Use separate API keys for development and production environments

### Monitoring & Reliability
1. **Comprehensive Logging**:
   - Set up structured logging for all email operations
   - Implement log retention policies compliant with financial data regulations

2. **Error Tracking**:
   - Integrate with Sentry or similar service for real-time error monitoring
   - Set up alerts for critical email failures, especially verification emails

3. **Rate Limiting**:
   - Implement proper rate limiting using Firestore or Redis
   - Add protections against email enumeration attacks

### Compliance
1. **Email Regulations**:
   - Ensure all emails include unsubscribe options where required by law
   - Include your physical address in emails (required by CAN-SPAM)
   - Store user consent records for email communications

2. **Data Privacy**:
   - Ensure email templates don't include sensitive personal information
   - Implement appropriate data retention policies for email logs

## Security

These functions implement several security measures:

1. Authentication checks for protected operations
2. Input validation for all parameters
3. Error message sanitization to prevent information leakage
4. Secure token generation for verification links

## Integration with Frontend

The frontend integrates with these functions via the Firebase Functions SDK. See `src/services/firebase/emailFunctions.ts` for the client-side implementation.
