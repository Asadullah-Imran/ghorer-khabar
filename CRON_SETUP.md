# Cron Job Setup for Subscription Order Generation

This document explains how to set up the automated order generation from active subscriptions.

## Overview

The system automatically generates orders for tomorrow's meals based on active subscription plans. This runs daily to create orders for the next day.

## API Endpoint

**Endpoint:** `/api/cron/generate-subscription-orders`  
**Methods:** `GET` or `POST`  
**Security:** Protected by `CRON_SECRET` environment variable (optional but recommended)

## Setup Options

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-subscription-orders",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs at midnight UTC every day.

**Note:** Vercel Cron requires a Pro plan or higher.

### Option 2: External Cron Service

Use a service like:
- [cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com) (Free tier available)
- [Cronitor](https://cronitor.io) (Free tier available)
- [GitHub Actions](https://docs.github.com/en/actions) (Free for public repos)

**Example cron-job.org setup:**
1. Create account at cron-job.org
2. Add new cron job
3. URL: `https://your-domain.com/api/cron/generate-subscription-orders`
4. Schedule: `0 0 * * *` (midnight UTC daily)
5. Method: GET or POST
6. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

### Option 3: GitHub Actions (Free)

Create `.github/workflows/generate-orders.yml`:

```yaml
name: Generate Subscription Orders

on:
  schedule:
    # Run daily at midnight UTC
    - cron: '0 0 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  generate-orders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Order Generation
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/generate-subscription-orders
```

Add `CRON_SECRET` to your GitHub repository secrets.

### Option 4: Manual Testing

You can manually trigger the endpoint for testing:

```bash
# Without secret (if CRON_SECRET is not set)
curl https://your-domain.com/api/cron/generate-subscription-orders

# With secret
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/generate-subscription-orders
```

## Environment Variables

Add to your `.env.local` or deployment environment:

```env
# Optional: Secret token to protect cron endpoint
CRON_SECRET=your-random-secret-token-here
```

**Security Note:** If `CRON_SECRET` is not set, the endpoint will be accessible to anyone. Set it in production!

## How It Works

1. **Runs Daily:** The cron job runs once per day (recommended: midnight UTC)
2. **Target Date:** Generates orders for **tomorrow** (next day)
3. **Process:**
   - Finds all ACTIVE subscriptions
   - Checks if subscription has started (startDate <= tomorrow)
   - Checks if subscription hasn't ended (endDate >= tomorrow or null)
   - For each subscription:
     - Gets tomorrow's day of week (MONDAY, TUESDAY, etc.)
     - Checks weekly_schedule for that day
     - Extracts dish IDs from meal slots (breakfast, lunch, snacks, dinner)
     - Creates Order with OrderItems
     - Links order to subscription via subscriptionId
     - Sends notifications to user and chef
4. **Deduplication:** Skips if order already exists for that subscription and date

## Response Format

```json
{
  "success": true,
  "date": "2024-01-17",
  "day": "WEDNESDAY",
  "results": {
    "processed": 10,
    "created": 8,
    "skipped": 2,
    "errors": []
  }
}
```

## Monitoring

Check your logs for:
- `[Subscription Orders]` prefix for all log messages
- Number of subscriptions processed
- Number of orders created
- Any errors encountered

## Troubleshooting

### Orders Not Being Created

1. **Check subscription status:** Only ACTIVE subscriptions are processed
2. **Check startDate:** Subscription must have started
3. **Check weekly_schedule:** Must have meals scheduled for tomorrow's day
4. **Check menu items:** Dish IDs in schedule must exist in menu_items table
5. **Check logs:** Look for error messages in the response

### Duplicate Orders

The system checks for existing orders, but if you run the cron multiple times in the same day, duplicates might occur. The check looks for orders created on the target date.

### Timezone Issues

The cron runs in UTC. Make sure your `tomorrow` calculation matches your business timezone. You may need to adjust the cron schedule or add timezone logic.

## Testing

1. **Create test subscription:**
   - Create a subscription plan with weekly_schedule
   - Create a user subscription with status ACTIVE
   - Set startDate to today or earlier

2. **Manually trigger:**
   ```bash
   curl -H "Authorization: Bearer YOUR_SECRET" \
     http://localhost:3000/api/cron/generate-subscription-orders
   ```

3. **Check results:**
   - Check orders table for new orders
   - Check notifications for user and chef
   - Verify order items match the schedule

## Migration Required

Before using this feature, run the database migration to add `subscriptionId` to the Order model:

```bash
npx prisma migrate dev --name add_subscription_id_to_orders
npx prisma generate
```
