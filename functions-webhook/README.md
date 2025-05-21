# Stripe Webhook Handler - Enterprise Grade Implementation

This is an isolated implementation of the Stripe webhook handler for subscription management, following enterprise security standards. It has been separated into its own function package to ensure compatibility with Firebase Functions v6.3.2 without affecting existing functions.

## Architecture

This webhook handler follows enterprise-grade development practices:

- **Secure webhook signature verification**: Ensures all webhook events are legitimate and originated from Stripe
- **Transaction-based database updates**: Ensures data integrity for all subscription operations
- **Comprehensive error handling and logging**: Captures detailed information for debugging while maintaining security
- **Audit trail**: Logs all subscription changes with timestamps and user information
- **Type safety**: Implements strong TypeScript typing for all operations

## Events Handled

This webhook handler processes the following Stripe events:

- `customer.subscription.created` - When a user subscribes
- `customer.subscription.updated` - When a subscription details are changed
- `customer.subscription.deleted` - When a subscription is canceled
- `invoice.paid` - When a payment succeeds
- `invoice.payment_failed` - When a payment fails

## Deployment

To deploy only this webhook handler without affecting other Firebase functions:

```bash
cd functions-webhook
npm install
npm run build
npm run deploy
```

This will deploy only the Stripe webhook handler as an independent function.

## Configuration

Set up the required environment variables:

```bash
firebase functions:config:set stripe.secret_key=YOUR_STRIPE_SECRET_KEY
firebase functions:config:set stripe.webhook_secret=YOUR_WEBHOOK_SECRET
```

## Testing

You can test the webhook using Stripe's CLI:

```bash
stripe listen --forward-to http://localhost:5001/assist-app-XXXXX/us-central1/stripeWebhook
```

## Security Considerations

- The webhook verifies the signature to confirm the request came from Stripe
- Error messages are sanitized to prevent leaking sensitive information
- All operations use Firestore transactions to ensure data consistency
- All events are logged for audit purposes
