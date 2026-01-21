#!/bin/bash

# Script to run all seed files with a specific seller ID
# Usage: ./scripts/run-all-seeds.sh

SELLER_ID="ad5f641d-5ac2-46d9-88f9-80a4acf5c73b"

echo "🌱 Running all seed scripts with Seller ID: $SELLER_ID"
echo ""

# Set the environment variable and run each seed script
export TEMP_Seller_ID=$SELLER_ID

echo "📝 Step 1/3: Seeding menu items..."
npm run seed:menu
if [ $? -ne 0 ]; then
  echo "❌ Menu seeding failed. Please check your database connection."
  exit 1
fi

echo ""
echo "📝 Step 2/3: Seeding subscription plans..."
npm run seed:subscriptions
if [ $? -ne 0 ]; then
  echo "❌ Subscription seeding failed."
  exit 1
fi

echo ""
echo "📝 Step 3/3: Seeding inventory items..."
npm run seed:inventory
if [ $? -ne 0 ]; then
  echo "❌ Inventory seeding failed."
  exit 1
fi

echo ""
echo "✅ All seeds completed successfully!"
