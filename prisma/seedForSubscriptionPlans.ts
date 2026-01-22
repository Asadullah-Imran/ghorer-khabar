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
 * Seed file for creating subscription meal plans
 * 
 * This seed file creates realistic subscription plans with:
 * - Weekly schedules with meal slots
 * - References to actual menu items (dishes)
 * - Associated with a specific kitchen
 * - Nutritional information
 * - Chef quotes and descriptions
 */

async function main() {
  console.log('🌱 Seeding subscription meal plans...')

  // REPLACE THIS WITH YOUR ACTUAL SELLER/USER ID
  // You can find this by querying: SELECT id FROM users WHERE role = 'SELLER' LIMIT 1;
  const SELLER_ID = process.env.TEMP_Seller_ID || "ad5f641d-5ac2-46d9-88f9-80a4acf5c73b"

  // Verify seller exists
  const seller = await prisma.user.findUnique({
    where: { id: SELLER_ID },
    select: { 
      id: true, 
      name: true, 
      role: true 
    },
  })

  if (!seller) {
    console.error(`❌ Seller/User with ID ${SELLER_ID} not found!`)
    console.log('Please update SELLER_ID in the seed file or set TEMP_Seller_ID env variable')
    process.exit(1)
  }

  console.log(`✅ Found seller: ${seller.name} (ID: ${seller.id})`)

  // Get kitchen for this seller
  const kitchen = await prisma.kitchen.findFirst({
    where: { sellerId: SELLER_ID },
    select: { 
      id: true, 
      name: true 
    },
  })

  if (!kitchen) {
    console.error(`❌ No kitchen found for seller ${SELLER_ID}!`)
    console.log('Please create a kitchen for this seller first')
    process.exit(1)
  }

  console.log(`✅ Found kitchen: ${kitchen.name} (ID: ${kitchen.id})`)

  // Get existing menu items for this seller with calories data
  const menuItems = await prisma.menu_items.findMany({
    where: { chef_id: SELLER_ID },
    select: { 
      id: true, 
      name: true, 
      category: true,
      calories: true,
      isVegetarian: true 
    },
    orderBy: { createdAt: 'desc' },
  })

  if (menuItems.length === 0) {
    console.error(`❌ No menu items found for this kitchen's chef!`)
    console.log('Please run the menu items seed first: npm run seed:menu')
    process.exit(1)
  }

  console.log(`✅ Found ${menuItems.length} menu items to use in plans`)

  // Helper function to get random dishes by category
  const getDishIdsByCategory = (category: string, count: number = 1): string[] => {
    const dishes = menuItems.filter(item => 
      item.category.toLowerCase().includes(category.toLowerCase())
    )
    if (dishes.length === 0) {
      // Fallback to any dishes if category not found
      return menuItems.slice(0, count).map(d => d.id)
    }
    return dishes.slice(0, count).map(d => d.id)
  }

  const getVegetarianDishes = (count: number = 1): string[] => {
    const vegDishes = menuItems.filter(item => item.isVegetarian)
    if (vegDishes.length === 0) {
      return menuItems.slice(0, count).map(d => d.id)
    }
    return vegDishes.slice(0, count).map(d => d.id)
  }

  const getRandomDishIds = (count: number = 1): string[] => {
    return menuItems.slice(0, count).map(d => d.id)
  }

  // Helper function to calculate nutritional data from dishes
  const calculateNutritionFromDishes = (dishIds: string[]): { calories: number; protein: string; carbs: string; fats: string } => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFats = 0

    dishIds.forEach(dishId => {
      const dish = menuItems.find(d => d.id === dishId)
      if (dish) {
        totalCalories += dish.calories || 0
        // Estimate macros based on calories (typical distribution)
        // Protein: ~25% of calories (4 cal/g), Carbs: ~50% (4 cal/g), Fats: ~25% (9 cal/g)
        totalProtein += (dish.calories || 0) * 0.25 / 4
        totalCarbs += (dish.calories || 0) * 0.50 / 4
        totalFats += (dish.calories || 0) * 0.25 / 9
      }
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein) + 'g',
      carbs: Math.round(totalCarbs) + 'g',
      fats: Math.round(totalFats) + 'g',
    }
  }

  // Helper function to calculate daily nutrition from entire schedule
  const calculateDailyNutrition = (schedule: any): { calories: number; protein: string; carbs: string; fats: string } => {
    let allDishIds: string[] = []

    // Collect all dish IDs from the weekly schedule
    Object.values(schedule).forEach((daySchedule: any) => {
      if (daySchedule && typeof daySchedule === 'object') {
        ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(mealType => {
          if (daySchedule[mealType]?.dishIds) {
            allDishIds.push(...daySchedule[mealType].dishIds)
          }
        })
      }
    })

    // Remove duplicates and calculate nutrition
    const uniqueDishIds = [...new Set(allDishIds)]
    const nutrition = calculateNutritionFromDishes(uniqueDishIds)

    return nutrition
  }

  // Define subscription plans
  const subscriptionPlans = [
    {
      name: "Daily Deluxe Pack",
      description: "Premium home-cooked meals delivered daily. Experience authentic Bengali cuisine with chef-crafted meals for breakfast, lunch, and dinner.",
      price: 8500,
      servingsPerMeal: 1,
      isActive: true,
      coverImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format",
      chefQuote: "I believe food is a language of love. This plan is designed to make you feel like you're eating at home.",
      weeklySchedule: {
        SATURDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getDishIdsByCategory("main", 1),
          },
          dinner: {
            time: "20:30",
            dishIds: getDishIdsByCategory("main", 1),
          },
        },
        SUNDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        MONDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        TUESDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        WEDNESDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        THURSDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        FRIDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
      },
    },
    {
      name: "Weekly Family Plan",
      description: "Complete meal solution for families of 4. Wholesome, nutritious meals that everyone will love.",
      price: 12000,
      servingsPerMeal: 4,
      isActive: true,
      coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format",
      chefQuote: "Healthy meals for happy families. Made with love, served with care.",
      weeklySchedule: {
        SATURDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        SUNDAY: {
          breakfast: {
            time: "08:30",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        MONDAY: {
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        TUESDAY: {
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        WEDNESDAY: {
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        THURSDAY: {
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
        FRIDAY: {
          lunch: {
            time: "13:30",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:30",
            dishIds: getRandomDishIds(1),
          },
        },
      },
    },
    {
      name: "Executive Lunch Box",
      description: "Single meal delivery for working professionals. Healthy, delicious lunch delivered to your office.",
      price: 2500,
      servingsPerMeal: 1,
      isActive: true,
      coverImage: "https://images.unsplash.com/photo-1562059390-a761a084768e?q=80&w=800&auto=format",
      chefQuote: "Quick, nutritious, and delicious - perfect for busy professionals.",
      weeklySchedule: {
        SATURDAY: {
          lunch: {
            time: "12:30",
            dishIds: getRandomDishIds(1),
          },
        },
        SUNDAY: {
          lunch: {
            time: "12:30",
            dishIds: getRandomDishIds(1),
          },
        },
        MONDAY: {
          lunch: {
            time: "12:30",
            dishIds: getRandomDishIds(1),
          },
        },
        TUESDAY: {
          lunch: {
            time: "12:30",
            dishIds: getRandomDishIds(1),
          },
        },
        WEDNESDAY: {
          lunch: {
            time: "12:30",
            dishIds: getRandomDishIds(1),
          },
        },
        THURSDAY: {
          lunch: {
            time: "12:30",
            dishIds: getRandomDishIds(1),
          },
        },
      },
    },
    {
      name: "Premium Full Week",
      description: "Complete meal solution for busy professionals. Three meals a day, seven days a week.",
      price: 15000,
      servingsPerMeal: 2,
      isActive: true,
      coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format",
      chefQuote: "Everything you need for a healthy, balanced diet. Leave the cooking to us.",
      weeklySchedule: {
        SATURDAY: {
          breakfast: {
            time: "08:00",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "19:30",
            dishIds: getRandomDishIds(1),
          },
        },
        SUNDAY: {
          breakfast: {
            time: "08:00",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "19:30",
            dishIds: getRandomDishIds(1),
          },
        },
        MONDAY: {
          breakfast: {
            time: "08:00",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "19:30",
            dishIds: getRandomDishIds(1),
          },
        },
        TUESDAY: {
          breakfast: {
            time: "08:00",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "19:30",
            dishIds: getRandomDishIds(1),
          },
        },
        WEDNESDAY: {
          breakfast: {
            time: "08:00",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "19:30",
            dishIds: getRandomDishIds(1),
          },
        },
        THURSDAY: {
          breakfast: {
            time: "08:00",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "19:30",
            dishIds: getRandomDishIds(1),
          },
        },
        FRIDAY: {
          breakfast: {
            time: "08:00",
            dishIds: getDishIdsByCategory("breakfast", 1),
          },
          lunch: {
            time: "13:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "19:30",
            dishIds: getRandomDishIds(1),
          },
        },
      },
    },
    {
      name: "Vegetarian Delight",
      description: "Pure vegetarian meal plan for health-conscious individuals. No meat, full flavor.",
      price: 7000,
      servingsPerMeal: 1,
      isActive: true,
      coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format",
      chefQuote: "Delicious vegetarian meals that celebrate the bounty of nature.",
      weeklySchedule: {
        SATURDAY: {
          lunch: {
            time: "13:00",
            dishIds: getVegetarianDishes(1),
          },
          dinner: {
            time: "20:00",
            dishIds: getVegetarianDishes(1),
          },
        },
        SUNDAY: {
          lunch: {
            time: "13:00",
            dishIds: getVegetarianDishes(1),
          },
          dinner: {
            time: "20:00",
            dishIds: getVegetarianDishes(1),
          },
        },
        MONDAY: {
          lunch: {
            time: "13:00",
            dishIds: getVegetarianDishes(1),
          },
          dinner: {
            time: "20:00",
            dishIds: getVegetarianDishes(1),
          },
        },
        TUESDAY: {
          lunch: {
            time: "13:00",
            dishIds: getVegetarianDishes(1),
          },
          dinner: {
            time: "20:00",
            dishIds: getVegetarianDishes(1),
          },
        },
        WEDNESDAY: {
          lunch: {
            time: "13:00",
            dishIds: getVegetarianDishes(1),
          },
          dinner: {
            time: "20:00",
            dishIds: getVegetarianDishes(1),
          },
        },
      },
    },
    {
      name: "Weekend Special",
      description: "Premium weekend meals for the whole family. Make your weekends special with our chef-crafted delicacies.",
      price: 3500,
      servingsPerMeal: 3,
      isActive: false, // Not currently active
      coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format",
      chefQuote: "Weekend meals should be special and memorable. We make that happen.",
      weeklySchedule: {
        SATURDAY: {
          lunch: {
            time: "14:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:00",
            dishIds: getRandomDishIds(1),
          },
        },
        SUNDAY: {
          lunch: {
            time: "14:00",
            dishIds: getRandomDishIds(1),
          },
          dinner: {
            time: "20:00",
            dishIds: getRandomDishIds(1),
          },
        },
      },
    },
  ]

  // Helper function to calculate meals per day from schedule
  function calculateMealsPerDay(schedule: any): number {
    const mealCounts = Object.values(schedule).map((daySchedule: any) => {
      return Object.keys(daySchedule).length
    })
    return Math.max(...mealCounts, 0)
  }

  console.log(`\n📝 Creating ${subscriptionPlans.length} subscription plans...\n`)

  let createdCount = 0
  for (const planData of subscriptionPlans) {
    try {
      const mealsPerDay = calculateMealsPerDay(planData.weeklySchedule)
      const nutrition = calculateDailyNutrition(planData.weeklySchedule)

      const plan = await prisma.subscription_plans.create({
        data: {
          kitchen_id: kitchen.id,
          name: planData.name,
          description: planData.description,
          price: planData.price,
          meals_per_day: mealsPerDay,
          servings_per_meal: planData.servingsPerMeal,
          is_active: planData.isActive,
          cover_image: planData.coverImage,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fats: nutrition.fats,
          chef_quote: planData.chefQuote,
          weekly_schedule: planData.weeklySchedule,
          subscriber_count: Math.floor(Math.random() * 50), // Random subscriber count for demo
          monthly_revenue: 0,
          rating: 0,
        },
      })

      createdCount++
      console.log(`✅ Created: ${plan.name}`)
      console.log(`   - Price: ৳${plan.price}`)
      console.log(`   - Meals per day: ${plan.meals_per_day}`)
      console.log(`   - Servings per meal: ${plan.servings_per_meal}`)
      console.log(`   - Nutrition: ${plan.calories} cal | Protein: ${plan.protein} | Carbs: ${plan.carbs} | Fats: ${plan.fats}`)
      console.log(`   - Status: ${plan.is_active ? 'Active' : 'Inactive'}`)
      console.log(`   - ID: ${plan.id}\n`)
    } catch (error) {
      console.error(`❌ Error creating plan "${planData.name}":`, error)
    }
  }

  console.log(`\n🎉 Seeding completed!`)
  console.log(`   - Total plans created: ${createdCount}/${subscriptionPlans.length}`)
  console.log(`   - Kitchen ID: ${kitchen.id}`)
  console.log(`   - Seller ID: ${SELLER_ID}`)
  console.log(`\n💡 Next steps:`)
  console.log(`   - View plans in your app`)
  console.log(`   - Test the subscription flow`)
  console.log(`   - Adjust meal schedules as needed\n`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
