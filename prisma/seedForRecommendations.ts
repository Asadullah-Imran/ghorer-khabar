import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import pg from 'pg'
import { PrismaClient } from '../generated/prisma/client'

config()

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/**
 * Seed file for creating user interaction data to enable ML recommendations
 * 
 * This seed file creates:
 * - Sample orders with order items for the test user
 * - Favorites (dishes, kitchens, subscription plans)
 * - Reviews with ratings
 * 
 * This data allows the ML recommendation system to learn user preferences
 * and generate personalized recommendations.
 */

async function main() {
  console.log('🌱 Seeding user interaction data for ML recommendations...')

  // Test user email
  const TEST_USER_EMAIL = 'dustoocelecrush6@gmail.com'

  // Find the test user
  const testUser = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  if (!testUser) {
    console.error(`❌ User with email ${TEST_USER_EMAIL} not found!`)
    console.log('Please make sure the user exists in the database')
    process.exit(1)
  }

  console.log(`✅ Found test user: ${testUser.name} (${testUser.email})`)
  console.log(`   User ID: ${testUser.id}\n`)

  // Get available kitchens
  const kitchens = await prisma.kitchen.findMany({
    where: {
      isActive: true,
      onboardingCompleted: true,
    },
    select: {
      id: true,
      name: true,
      sellerId: true,
    },
    take: 5,
  })

  if (kitchens.length === 0) {
    console.error('❌ No active kitchens found!')
    console.log('Please create kitchens first or run the kitchen seed')
    process.exit(1)
  }

  console.log(`✅ Found ${kitchens.length} active kitchens\n`)

  // Get menu items categorized
  const allMenuItems = await prisma.menu_items.findMany({
    where: {
      isAvailable: true,
    },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      chef_id: true,
    },
  })

  if (allMenuItems.length === 0) {
    console.error('❌ No menu items found!')
    console.log('Please run the menu items seed first: npm run seed:menu')
    process.exit(1)
  }

  console.log(`✅ Found ${allMenuItems.length} menu items\n`)

  // Helper function to get random items from an array
  function getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, array.length))
  }

  // Helper function to get items by category
  function getItemsByCategory(category: string, count: number = 3) {
    const items = allMenuItems.filter(item =>
      item.category.toLowerCase().includes(category.toLowerCase())
    )
    return getRandomItems(items.length > 0 ? items : allMenuItems, count)
  }

  // ========================================
  // 1. CREATE SAMPLE ORDERS
  // ========================================
  console.log('📦 Creating sample orders...\n')

  const ordersToCreate = [
    {
      kitchen: kitchens[0],
      items: getItemsByCategory('beef', 2),
      status: 'COMPLETED' as const,
      daysAgo: 15,
    },
    {
      kitchen: kitchens[1],
      items: getItemsByCategory('rice', 2),
      status: 'COMPLETED' as const,
      daysAgo: 10,
    },
    {
      kitchen: kitchens[0],
      items: getItemsByCategory('chicken', 2),
      status: 'COMPLETED' as const,
      daysAgo: 7,
    },
    {
      kitchen: kitchens[2] || kitchens[0],
      items: getItemsByCategory('fish', 2),
      status: 'COMPLETED' as const,
      daysAgo: 5,
    },
    {
      kitchen: kitchens[1],
      items: getRandomItems(allMenuItems, 3),
      status: 'COMPLETED' as const,
      daysAgo: 3,
    },
  ]

  let createdOrders = 0
  for (const orderData of ordersToCreate) {
    try {
      const total = orderData.items.reduce((sum, item) => sum + item.price, 0)
      const orderDate = new Date()
      orderDate.setDate(orderDate.getDate() - orderData.daysAgo)

      // Set delivery date to tomorrow from order creation date
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      deliveryDate.setHours(13, 0, 0, 0); // Default to lunch time (1 PM)

      const order = await prisma.order.create({
        data: {
          userId: testUser.id,
          kitchenId: orderData.kitchen.id,
          total: total,
          status: orderData.status,
          createdAt: orderDate,
          updatedAt: orderDate,
          deliveryDate: deliveryDate,
          deliveryTimeSlot: "LUNCH", // Default to lunch for seed data
          items: {
            create: orderData.items.map(item => ({
              menuItemId: item.id,
              quantity: Math.floor(Math.random() * 2) + 1, // 1-2 quantity
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      })

      createdOrders++
      console.log(`✅ Order ${createdOrders}: ${orderData.kitchen.name}`)
      console.log(`   - Total: ৳${total}`)
      console.log(`   - Items: ${order.items.map(i => i.menuItem.name).join(', ')}`)
      console.log(`   - Date: ${orderDate.toLocaleDateString()}`)
      console.log(`   - Status: ${order.status}\n`)
    } catch (error) {
      console.error(`❌ Error creating order:`, error)
    }
  }

  // ========================================
  // 2. CREATE FAVORITES
  // ========================================
  console.log('\n⭐ Creating favorites...\n')

  // Favorite some dishes
  const dishesToFavorite = getRandomItems(allMenuItems, 5)
  let favoritedDishes = 0

  for (const dish of dishesToFavorite) {
    try {
      await prisma.favorite.create({
        data: {
          userId: testUser.id,
          dishId: dish.id,
        },
      })
      favoritedDishes++
      console.log(`✅ Favorited dish: ${dish.name}`)
    } catch (error) {
      // Ignore duplicates
      console.log(`⚠️  Already favorited: ${dish.name}`)
    }
  }

  // Favorite some kitchens
  const kitchensToFavorite = getRandomItems(kitchens, 2)
  let favoritedKitchens = 0

  for (const kitchen of kitchensToFavorite) {
    try {
      await prisma.favorite.create({
        data: {
          userId: testUser.id,
          kitchenId: kitchen.id,
        },
      })
      favoritedKitchens++
      console.log(`✅ Favorited kitchen: ${kitchen.name}`)
    } catch (error) {
      console.log(`⚠️  Already favorited: ${kitchen.name}`)
    }
  }

  // Favorite some subscription plans
  const subscriptionPlans = await prisma.subscription_plans.findMany({
    where: {
      is_active: true,
    },
    select: {
      id: true,
      name: true,
    },
    take: 3,
  })

  let favoritedPlans = 0
  for (const plan of subscriptionPlans) {
    try {
      await prisma.favorite.create({
        data: {
          userId: testUser.id,
          planId: plan.id,
        },
      })
      favoritedPlans++
      console.log(`✅ Favorited plan: ${plan.name}`)
    } catch (error) {
      console.log(`⚠️  Already favorited: ${plan.name}`)
    }
  }

  // ========================================
  // 3. CREATE REVIEWS
  // ========================================
  console.log('\n📝 Creating reviews...\n')

  // Get user's completed orders to review
  const ordersToReview = await prisma.order.findMany({
    where: {
      userId: testUser.id,
      status: 'COMPLETED',
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    take: 3, // Review 3 orders
  })

  let createdReviews = 0
  for (const order of ordersToReview) {
    // Review each item in the order
    for (const orderItem of order.items) {
      try {
        const rating = Math.floor(Math.random() * 2) + 4 // 4-5 stars (positive reviews)
        const comments = [
          'Absolutely delicious! Will order again.',
          'Great taste and quality. Highly recommended!',
          'Perfect portion size and amazing flavor.',
          'Loved it! The best homemade food.',
          'Excellent service and tasty food.',
        ]

        await prisma.review.create({
          data: {
            userId: testUser.id,
            menuItemId: orderItem.menuItemId,
            orderId: order.id,
            rating: rating,
            comment: comments[Math.floor(Math.random() * comments.length)],
          },
        })

        // Update menu item rating
        const existingReviews = await prisma.review.findMany({
          where: { menuItemId: orderItem.menuItemId },
          select: { rating: true },
        })

        const avgRating =
          existingReviews.reduce((sum, r) => sum + r.rating, 0) /
          existingReviews.length

        await prisma.menu_items.update({
          where: { id: orderItem.menuItemId },
          data: {
            rating: avgRating,
            reviewCount: existingReviews.length,
          },
        })

        createdReviews++
        console.log(`✅ Reviewed: ${orderItem.menuItem.name} (${rating}⭐)`)
      } catch (error) {
        // Ignore duplicates (same user can't review same item from same order twice)
        console.log(`⚠️  Already reviewed: ${orderItem.menuItem.name}`)
      }
    }
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Seeding completed successfully!')
  console.log('='.repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`   User: ${testUser.name} (${testUser.email})`)
  console.log(`   User ID: ${testUser.id}`)
  console.log(`\n   ✅ Orders created: ${createdOrders}`)
  console.log(`   ⭐ Dishes favorited: ${favoritedDishes}`)
  console.log(`   🏠 Kitchens favorited: ${favoritedKitchens}`)
  console.log(`   📅 Plans favorited: ${favoritedPlans}`)
  console.log(`   📝 Reviews created: ${createdReviews}`)

  console.log(`\n💡 Next steps:`)
  console.log(`   1. Test the recommendation API:`)
  console.log(`      curl "http://localhost:3000/api/recommendations/dishes/${testUser.id}?limit=10"`)
  console.log(`\n   2. You should now see personalized recommendations based on:`)
  console.log(`      - Preferred categories (e.g., Beef, Rice, Chicken)`)
  console.log(`      - Favorite kitchens`)
  console.log(`      - Price range from order history`)
  console.log(`      - Highly-rated items`)
  console.log(`\n   3. The more you interact, the better the recommendations get!`)
  console.log('')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
