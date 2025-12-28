# Stripe Integration Setup Guide

This project includes Stripe payment integration for the $10 Pro subscription feature.

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API Keys
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)

### 2. Configure Backend Environment Variables

Add the following to `/app/backend/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173
```

### 3. Set Up Stripe Products

The Pro Plan product is already configured with:
- **Price ID**: `price_1SigMZPcK8tlwdsdzcMJ2AFw`
- **Amount**: $10.00 (one-time payment)
- **Duration**: 30 days of Pro access

This price ID is hardcoded in `/app/backend/server.ts` line ~805.

### 4. Configure Webhook (for Production)

1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your backend `.env` as `STRIPE_WEBHOOK_SECRET`

### 5. Test the Integration

#### Test Mode (without actual payment):
1. Use Stripe test cards: https://stripe.com/docs/testing
2. Test card number: `4242 4242 4242 4242`
3. Use any future expiry date, any CVC, and any postal code

#### Test Flow:
1. Login to the app
2. Go to Profile tab
3. Click "Upgrade to Pro"
4. Click "Subscribe Now" in the modal
5. You'll be redirected to Stripe Checkout
6. Complete the test payment
7. You'll be redirected back to the profile page
8. The webhook will process the payment and activate your Pro subscription

## Architecture

### Frontend (Expo)
- **SubscriptionModal**: Displays Pro features and starts checkout
- **Profile Screen**: Shows subscription status and handles success/cancel redirects
- **api.ts**: API service with `createCheckoutSession()` method

### Backend (Express)
- **POST /api/subscription/create-checkout**: Creates Stripe Checkout session
- **POST /api/webhooks/stripe**: Handles Stripe webhook events
- **GET /api/subscription/status**: Returns current subscription status
- **POST /api/subscription/cancel**: Cancels active subscription

### Database
New columns added to `users` table:
- `stripe_customer_id`: Stripe customer ID
- `stripe_subscription_id`: Stripe subscription ID

New columns added to `subscription_transactions` table:
- `stripe_payment_intent_id`: Payment intent ID from Stripe
- `stripe_subscription_id`: Related subscription ID

## Important Notes

1. **Test Mode**: Use test API keys (starting with `sk_test_` and `pk_test_`) for development
2. **Production Mode**: Replace with live keys (starting with `sk_live_` and `pk_live_`) for production
3. **Webhook Secret**: Required for production to verify webhook signatures
4. **Security**: Never commit API keys to git. Use environment variables only
5. **Price ID**: Update the hardcoded price ID in the backend if you create a new product

## Troubleshooting

### Webhook not working locally:
- Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks to localhost:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

### Payment succeeds but subscription not activated:
- Check backend logs for webhook processing errors
- Verify `user_id` is correctly passed in checkout session metadata
- Ensure database has the new Stripe columns (run `node initdb.js`)

### Checkout redirect fails:
- Verify `FRONTEND_URL` environment variable is set correctly
- Check that success/cancel URLs in checkout session match your frontend URL

## Support

For Stripe-specific issues, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
