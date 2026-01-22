import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import pg from 'pg'
import { OrderStatus, PrismaClient } from '../generated/prisma/client'

config()

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Sample reviews with various sentiments for NLP testing
const SAMPLE_REVIEWS = [
  // Positive reviews
  { rating: 5, comment: "Delicious food! The biryani was fresh and authentic. Will definitely order again." },
  { rating: 5, comment: "Amazing taste, great quality. Best homemade food in the area." },
  { rating: 4, comment: "Fast delivery and friendly service. The rice was tasty and well seasoned." },
  { rating: 5, comment: "Highly recommend this kitchen! The portion size was perfect and food was still hot." },
  { rating: 4, comment: "Good value for money. Fresh ingredients and flavorful dishes." },
  
  // Mixed reviews
  { rating: 3, comment: "Food was okay, but a bit too salty for my taste. Otherwise good quality." },
  { rating: 3, comment: "Delivery was late but the food was still warm. Tastes homemade." },
  
  // Negative reviews for improvement detection
  { rating: 2, comment: "The curry was too spicy and I couldn't eat it. Please add less chili." },
  { rating: 2, comment: "Portion was very small for the price. Expected more food." },
  { rating: 3, comment: "Food arrived cold. Packaging needs improvement." },
  { rating: 2, comment: "Too salty! Had to drink lots of water. Please reduce salt." },
  { rating: 3, comment: "Waited over an hour for delivery. Late delivery ruined the experience." },
];

async function seedReviews() {
  console.log("🌱 Starting review seeding for AI Kitchen Intelligence testing...\n");

  // Find a seller user
  const sellerUser = await prisma.user.findFirst({
    where: { role: "SELLER" },
    include: { kitchens: true },
  });

  if (!sellerUser || sellerUser.kitchens.length === 0) {
    console.error("❌ No seller with a kitchen found. Please run the main seed first.");
    return;
  }

  const kitchen = sellerUser.kitchens[0];
  console.log(`📍 Using kitchen: ${kitchen.name}`);

  // Get menu items for this kitchen's seller
  const menuItems = await prisma.menu_items.findMany({
    where: { chef_id: sellerUser.id },
    take: 5,
  });

  if (menuItems.length === 0) {
    console.error("❌ No menu items found. Please add menu items first.");
    return;
  }

  console.log(`🍽️  Found ${menuItems.length} menu items\n`);

  // Find a buyer user
  const buyerUser = await prisma.user.findFirst({
    where: { role: "BUYER" },
  });

  if (!buyerUser) {
    console.error("❌ No buyer user found. Please run the main seed first.");
    return;
  }

  // Get existing completed orders for the buyer
  const existingOrders = await prisma.order.findMany({
    where: { 
      userId: buyerUser.id,
      kitchenId: kitchen.id,
      status: OrderStatus.COMPLETED,
    },
    take: SAMPLE_REVIEWS.length,
    include: { items: true },
  });

  // Use existing orders or create new ones
  const orders = [...existingOrders];

  // If not enough orders, create some
  if (orders.length < SAMPLE_REVIEWS.length) {
    console.log("📦 Creating sample completed orders...\n");
    
    for (let i = orders.length; i < SAMPLE_REVIEWS.length; i++) {
      const menuItem = menuItems[i % menuItems.length];
      // Set delivery date to tomorrow from now
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      deliveryDate.setHours(13, 0, 0, 0); // Default to lunch time (1 PM)

      const order = await prisma.order.create({
        data: {
          userId: buyerUser.id,
          kitchenId: kitchen.id,
          status: OrderStatus.COMPLETED,
          total: Number(menuItem.price),
          deliveryDate: deliveryDate,
          deliveryTimeSlot: "LUNCH", // Default to lunch for seed data
          items: {
            create: {
              menuItemId: menuItem.id,
              quantity: 1,
              price: Number(menuItem.price),
            },
          },
        },
        include: { items: true },
      });
      orders.push(order);
    }
  }

  console.log(`✅ ${orders.length} orders ready for reviews\n`);

  // Create reviews
  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < Math.min(orders.length, SAMPLE_REVIEWS.length); i++) {
    const order = orders[i];
    const reviewData = SAMPLE_REVIEWS[i];

    if (!order.items || order.items.length === 0) continue;
    
    const orderItem = order.items[0];

    try {
      await prisma.review.create({
        data: {
          userId: buyerUser.id,
          menuItemId: orderItem.menuItemId,
          orderId: order.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      });
      createdCount++;
      console.log(`✅ Created review (${reviewData.rating}⭐): "${reviewData.comment.substring(0, 40)}..."`);
    } catch (error: unknown) {
      const prismaError = error as { code?: string; message?: string };
      if (prismaError.code === "P2002") {
        skippedCount++;
        console.log(`⏭️  Review already exists, skipping...`);
      } else {
        console.error(`❌ Error creating review:`, prismaError.message);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   ✅ Created: ${createdCount} reviews`);
  console.log(`   ⏭️  Skipped: ${skippedCount} (already exist)`);
  console.log("=".repeat(50));
  console.log("\n🎉 Review seeding complete!");
  console.log("   You can now test the AI Kitchen Intelligence feature.");
}

seedReviews()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
