# Environment Setup Guide

This guide explains how to configure environment variables for your CreatorHub application.

## 🔐 Security Best Practice

**IMPORTANT**: This project uses Replit's Secrets Manager to securely store sensitive information. Never commit actual API keys or secrets to `.env` files.

## ✅ Current Configuration Status

### Already Configured (via Replit Integrations)

The following secrets are already set up and working:

#### Database (PostgreSQL)
- `DATABASE_URL` - Full connection string
- `PGHOST` - PostgreSQL host
- `PGPORT` - PostgreSQL port (5432)
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

#### Authentication
- `SESSION_SECRET` - Session encryption key

#### Object Storage (Google Cloud Storage)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` - Bucket ID
- `PUBLIC_OBJECT_SEARCH_PATHS` - Public directory path
- `PRIVATE_OBJECT_DIR` - Private directory path

#### Stripe (Partial)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key

---

## ⚙️ How to Add Missing Secrets

### For Production Stripe Keys

If you need to update your Stripe keys:

1. **Get your Stripe API keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your secret key (starts with `sk_live_` or `sk_test_`)
   - Copy your publishable key (starts with `pk_live_` or `pk_test_`)

2. **Add to Replit Secrets:**
   - Open the "Tools" panel in Replit
   - Click on "Secrets" 
   - Update these keys:
     - `STRIPE_SECRET_KEY` = `sk_test_...` (your secret key)
     - `VITE_STRIPE_PUBLIC_KEY` = `pk_test_...` (your publishable key)

### For Testing Environment (Optional)

If you want separate keys for testing:

1. Add these secrets in Replit:
   - `TESTING_STRIPE_SECRET_KEY` = `sk_test_...`
   - `TESTING_VITE_STRIPE_PUBLIC_KEY` = `pk_test_...`

---

## 🚀 Quick Start

1. **Check Current Secrets:**
   - All database and storage secrets are already configured
   - Session secret is already set
   
2. **Add Your Stripe Keys:**
   - Follow the steps above to add your Stripe API keys
   - Restart the application after adding secrets

3. **Verify Setup:**
   - Navigate to your app
   - Try enabling creator mode
   - Test the subscription flow

---

## 📋 Complete Environment Variables Reference

### Required for Basic Functionality
```bash
DATABASE_URL              # ✅ Already configured
SESSION_SECRET            # ✅ Already configured
DEFAULT_OBJECT_STORAGE_BUCKET_ID  # ✅ Already configured
```

### Required for Payments
```bash
STRIPE_SECRET_KEY         # ⚠️ Update with your key
VITE_STRIPE_PUBLIC_KEY    # ⚠️ Update with your key
```

### Optional for Testing
```bash
TESTING_STRIPE_SECRET_KEY          # Optional
TESTING_VITE_STRIPE_PUBLIC_KEY     # Optional
```

---

## 🔍 Troubleshooting

### Stripe Integration Not Working?

1. Verify your Stripe keys are set in Replit Secrets
2. Check that keys start with the correct prefix:
   - Secret key: `sk_test_` or `sk_live_`
   - Publishable key: `pk_test_` or `pk_live_`
3. Restart the application after adding/updating secrets

### Database Connection Issues?

The database is managed by Replit's PostgreSQL integration. If you have issues:
1. Check that the database is active in the Replit UI
2. All connection details are automatically managed

### Object Storage Issues?

Object storage is managed by Replit's GCS integration:
1. Verify the integration is active
2. Check that bucket permissions are correct

---

## 📝 Notes

- **Production Deployment**: When publishing your app, ensure all secrets are configured in the production environment
- **Never Commit Secrets**: The `.env.example` file is for documentation only
- **Stripe Test Mode**: Use test keys (`sk_test_` and `pk_test_`) during development
- **Automatic Restarts**: The application automatically restarts when secrets are updated

---

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- [Replit Secrets Documentation](https://docs.replit.com/programming-ide/workspace-features/secrets)
