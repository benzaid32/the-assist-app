# Stripe Webhook Setup for TheAssistApp

This guide explains how to set up the Stripe webhook integration to ensure subscription payments are properly processed and updated in your Firebase database, even if users lose authentication state during the payment flow.

## What We Implemented

We've added a server-side webhook handler that processes Stripe events directly, bypassing the need for client-side authentication when updating subscription status. This makes the payment flow more robust and eliminates the "Authentication required to update subscription" error that was occurring.

## Configuration Steps

### 1. Set Environment Variables

First, add the required environment variables to your Firebase Functions:

```bash
# From the functions directory
firebase functions:config:set stripe.secret_key="your_stripe_secret_key" stripe.webhook_secret="your_stripe_webhook_secret"
```

Or for local development, add these values to your `.env` file:

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 2. Configure Webhook in Stripe Dashboard

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** > **Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL:
   - For production: `https://us-central1-assist-app-6c044.cloudfunctions.net/stripeWebhookHandler`
   - For testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events to your local environment

5. Add the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

6. After creating the webhook, Stripe will provide a **Webhook Signing Secret**. Save this value as your `STRIPE_WEBHOOK_SECRET`.

### 3. Deploy Your Firebase Functions

Deploy your updated functions to Firebase:

```bash
# From the functions directory
firebase deploy --only functions
```

### 4. Test the Integration

1. Make a test subscription payment
2. Confirm that even if the user is redirected back to the success page without authentication state, their subscription status will still be updated correctly
3. You can monitor webhook deliveries in the Stripe Dashboard under **Developers** > **Webhooks** > **View deliveries**

## How It Works

1. When a customer completes payment, Stripe sends a `checkout.session.completed` event to our webhook
2. Our webhook handler verifies the signature to ensure the request is from Stripe
3. The handler retrieves the customer ID and subscription details from the event
4. It updates the user's subscription status in Firebase without requiring user authentication
5. The success page now just provides UI feedback to the user, while the actual subscription update happens securely on the server

## Troubleshooting

If you encounter issues with the webhook:

1. Check Firebase Function logs for any errors
2. Verify webhook events are being sent correctly in the Stripe Dashboard
3. Confirm your webhook signing secret is correctly configured
4. For testing locally, use the Stripe CLI's forwarding feature

## Security Considerations

This implementation is more secure because:

1. It uses webhook signature verification to confirm events are actually from Stripe
2. It doesn't rely on client-side authentication for critical subscription updates
3. It handles the subscription status update atomically using Firebase batch operations
