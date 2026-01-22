import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import pg from 'pg'
import { PrismaClient } from '../generated/prisma/client'
import bcrypt from 'bcryptjs'

config()

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/**
 * Complete Seed File for Ghorer Khabar
 * 
 * Creates:
 * - 5 Kitchens with unique sellers/chefs
 * - 10+ dishes per kitchen (50+ total dishes)
 * - Subscription plans for each kitchen
 * - 25 customers (buyers)
 * - Multiple orders (some completed)
 * - Reviews on completed orders
 */

// Helper function to generate random coordinates around Dhaka
const generateDhakaCoordinates = () => {
  const baseLatitude = 23.8103
  const baseLongitude = 90.4125
  const variation = 0.05 // ~5km range
  
  return {
    latitude: baseLatitude + (Math.random() - 0.5) * variation,
    longitude: baseLongitude + (Math.random() - 0.5) * variation,
  }
}

// Helper function to generate a random rating
const randomRating = (min = 3.5, max = 5.0) => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

// Helper function to pick random items from array
const pickRandom = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, arr.length))
}

// Helper function to generate prices ending in .00 or .99
const generatePrice = (min: number, max: number): number => {
  const basePrice = Math.floor(Math.random() * (max - min) + min)
  const endsWith99 = Math.random() > 0.5
  return endsWith99 ? basePrice + 0.99 : basePrice + 0.00
}

// Helper function to round prices to end in .00 or .99
const roundPriceToEndDigits = (price: number): number => {
  const base = Math.floor(price)
  const decimal = price - base
  return decimal < 0.5 ? base + 0.00 : base + 0.99
}

// Helper function to create proper weekly schedule for subscription plans
const createWeeklySchedule = (dishes: any[], mealsPerDay: number): Record<string, any> => {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner']
  const mealTimes: Record<string, string> = {
    breakfast: '08:30',
    lunch: '13:00',
    snacks: '16:00',
    dinner: '20:00',
  }
  
  const schedule: Record<string, any> = {}
  
  for (const day of days) {
    schedule[day] = {}
    const selectedMeals = pickRandom(mealTypes, mealsPerDay)
    
    for (const meal of selectedMeals) {
      schedule[day][meal] = {
        time: mealTimes[meal],
        dishIds: pickRandom(dishes, 2).map((d: any) => d.id),
      }
    }
  }
  
  return schedule
}

// Professional food images from Pexels - high-quality, reliable, and free
// All images are real photos with proper licensing
const kitchenCoverImages = [
  'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
  'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
  'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
  'https://images.pexels.com/photos/1624500/pexels-photo-1624500.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
]

const dishImageBank: Record<string, string[]> = {
  'Hyderabadi Chicken Biryani': ['https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Beef Bhuna Khichuri': ['https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Mutton Kacchi Biryani': ['https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Chicken Korma': ['https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Shorshe Ilish': ['https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Vegetable Khichuri': ['https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Rui Macher Kalia': ['https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Chingri Malai Curry': ['https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Chicken Rezala': ['https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Paneer Butter Masala': ['https://images.pexels.com/photos/1624500/pexels-photo-1624500.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Aloo Paratha with Curd': ['https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Egg Bhurji with Ruti': ['https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Puri with Aloo Bhaji': ['https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Dal Tadka': ['https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Mixed Vegetable Bhaji': ['https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Begun Bhaji': ['https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Raita': ['https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Payesh': ['https://images.pexels.com/photos/1624500/pexels-photo-1624500.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Mishti Doi': ['https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Rosogolla': ['https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
  'Gulab Jamun': ['https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop'],
}

const dishImageFallbacks = [
  'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
  'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
  'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
]

const planCoverImages = [
  'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
  'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
  'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1400&h=800&fit=crop',
]

const getKitchenCoverImage = (index: number) => kitchenCoverImages[index % kitchenCoverImages.length]
const getDishImage = (name: string) => {
  const bank = dishImageBank[name]
  if (bank && bank.length) return bank[Math.floor(Math.random() * bank.length)]
  return dishImageFallbacks[Math.floor(Math.random() * dishImageFallbacks.length)]
}
const getPlanCoverImage = () => planCoverImages[Math.floor(Math.random() * planCoverImages.length)]

async function main() {
  console.log('🌱 Starting complete seed process...\n')

  // ==================== STEP 0: Cleanup Existing Data ====================
  console.log('🧹 Cleaning up existing seed data...')
  
  // Delete in correct order (respecting foreign key constraints)
  await prisma.review.deleteMany({})
  await prisma.favorite.deleteMany({})
  await prisma.user_subscriptions.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.subscription_plans.deleteMany({})
  await prisma.ingredients.deleteMany({})
  await prisma.menu_item_images.deleteMany({})
  await prisma.menu_items.deleteMany({})
  await prisma.kitchenGallery.deleteMany({})
  await prisma.kitchen.deleteMany({})
  await prisma.address.deleteMany({})
  await prisma.user.deleteMany({})
  
  console.log('✅ Cleanup completed\n')

  // Hash the common password for all users (testing purposes)
  const commonPassword = 'asdfasdf'
  const hashedPassword = await bcrypt.hash(commonPassword, 10)
  console.log(`🔐 Using password: "${commonPassword}" (hashed with bcrypt)\n`)

  // ==================== STEP 1: Create 5 Sellers/Chefs ====================
  console.log('👨‍🍳 Creating 5 sellers/chefs...')
  
  const sellersData = [
    {
      name: 'Fatima Rahman',
      email: 'fatima.rahman@ghorerkhabar.com',
      kitchenName: "Fatima's Home Kitchen",
      kitchenType: 'Home Kitchen',
      kitchenDescription: 'Authentic Bengali home-style cooking with a modern twist. Specializing in traditional recipes passed down through generations.',
      area: 'Dhanmondi',
    },
    {
      name: 'Kamal Hossain',
      email: 'kamal.hossain@ghorerkhabar.com',
      kitchenName: "Kamal's Biryani House",
      kitchenType: 'Specialty Kitchen',
      kitchenDescription: 'Master of Biryani and Kacchi. Over 15 years of experience in creating the perfect dum biryani.',
      area: 'Gulshan',
    },
    {
      name: 'Shabnam Akter',
      email: 'shabnam.akter@ghorerkhabar.com',
      kitchenName: "Shabnam's Healthy Meals",
      kitchenType: 'Health Kitchen',
      kitchenDescription: 'Focus on nutritious, balanced meals. Perfect for health-conscious individuals and families.',
      area: 'Banani',
    },
    {
      name: 'Rahim Ahmed',
      email: 'rahim.ahmed@ghorerkhabar.com',
      kitchenName: "Rahim's Fusion Kitchen",
      kitchenType: 'Fusion Kitchen',
      kitchenDescription: 'Blending traditional Bengali flavors with international cuisine. Unique and innovative dishes.',
      area: 'Uttara',
    },
    {
      name: 'Nasrin Begum',
      email: 'nasrin.begum@ghorerkhabar.com',
      kitchenName: "Nasrin's Vegetarian Delights",
      kitchenType: 'Vegetarian Kitchen',
      kitchenDescription: 'Exclusively vegetarian Bengali cuisine. Proving that vegetarian food can be incredibly delicious.',
      area: 'Mohammadpur',
    },
  ]

  const sellers: any[] = []
  const kitchens: any[] = []

  for (const [sellerIndex, sellerData] of sellersData.entries()) {
    const coords = generateDhakaCoordinates()
    
    // Create seller user
    const seller = await prisma.user.create({
      data: {
        id: `seller_${Math.random().toString(36).substring(7)}`,
        name: sellerData.name,
        email: sellerData.email,
        password: hashedPassword,
        role: 'SELLER',
        emailVerified: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerData.name)}&background=random`,
      },
    })
    sellers.push(seller)

    // Create address for kitchen
    const address = await prisma.address.create({
      data: {
        userId: seller.id,
        label: 'Kitchen Address',
        address: `${sellerData.area}, Dhaka`,
        zone: sellerData.area,
        latitude: coords.latitude,
        longitude: coords.longitude,
        isDefault: true,
        isKitchenAddress: true,
      },
    })

    // Create kitchen
    const kitchen = await prisma.kitchen.create({
      data: {
        sellerId: seller.id,
        name: sellerData.kitchenName,
        type: sellerData.kitchenType,
        description: sellerData.kitchenDescription,
        location: `${sellerData.area}, Dhaka`,
        area: sellerData.area,
        addressId: address.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
        onboardingCompleted: true,
        isVerified: true,
        isActive: true,
        isOpen: true,
        kriScore: Math.floor(Math.random() * 30) + 70, // 70-100
        rating: randomRating(4.0, 5.0),
        reviewCount: Math.floor(Math.random() * 50) + 10,
        totalOrders: Math.floor(Math.random() * 200) + 50,
        totalRevenue: Math.floor(Math.random() * 100000) + 50000,
        satisfactionRate: randomRating(0.85, 0.98), // 85%-98% as decimal
        responseTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
        deliveryRate: randomRating(0.90, 0.99), // 90%-99% as decimal
        coverImage: getKitchenCoverImage(sellerIndex),
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerData.kitchenName)}&background=random`,
      },
    })
    kitchens.push(kitchen)

    console.log(`✅ Created seller: ${seller.name} with kitchen: ${kitchen.name}`)
  }

  // ==================== STEP 2: Create Dishes (10+ per kitchen) ====================
  console.log('\n🍽️  Creating dishes for each kitchen...')

  const dishTemplates = [
    // Main Courses
    { name: 'Hyderabadi Chicken Biryani', category: 'Main Course', price: 350, prepTime: 45, calories: 800, spiciness: 'Medium', isVegetarian: false },
    { name: 'Beef Bhuna Khichuri', category: 'Main Course', price: 420, prepTime: 50, calories: 950, spiciness: 'High', isVegetarian: false },
    { name: 'Mutton Kacchi Biryani', category: 'Main Course', price: 550, prepTime: 120, calories: 1200, spiciness: 'Medium', isVegetarian: false },
    { name: 'Chicken Korma', category: 'Main Course', price: 280, prepTime: 40, calories: 550, spiciness: 'Mild', isVegetarian: false },
    { name: 'Shorshe Ilish', category: 'Main Course', price: 650, prepTime: 40, calories: 600, spiciness: 'High', isVegetarian: false },
    { name: 'Vegetable Khichuri', category: 'Main Course', price: 180, prepTime: 35, calories: 400, spiciness: 'Medium', isVegetarian: true },
    { name: 'Rui Macher Kalia', category: 'Main Course', price: 280, prepTime: 35, calories: 480, spiciness: 'Medium', isVegetarian: false },
    { name: 'Chingri Malai Curry', category: 'Main Course', price: 480, prepTime: 30, calories: 520, spiciness: 'Mild', isVegetarian: false },
    { name: 'Chicken Rezala', category: 'Main Course', price: 320, prepTime: 45, calories: 620, spiciness: 'Medium', isVegetarian: false },
    { name: 'Paneer Butter Masala', category: 'Main Course', price: 240, prepTime: 30, calories: 450, spiciness: 'Mild', isVegetarian: true },
    
    // Breakfast Items
    { name: 'Aloo Paratha with Curd', category: 'Breakfast', price: 120, prepTime: 25, calories: 450, spiciness: 'Mild', isVegetarian: true },
    { name: 'Egg Bhurji with Ruti', category: 'Breakfast', price: 150, prepTime: 20, calories: 380, spiciness: 'Medium', isVegetarian: false },
    { name: 'Puri with Aloo Bhaji', category: 'Breakfast', price: 130, prepTime: 30, calories: 520, spiciness: 'Mild', isVegetarian: true },
    
    // Side Dishes
    { name: 'Dal Tadka', category: 'Side Dish', price: 100, prepTime: 20, calories: 200, spiciness: 'Mild', isVegetarian: true },
    { name: 'Mixed Vegetable Bhaji', category: 'Side Dish', price: 80, prepTime: 25, calories: 150, spiciness: 'Mild', isVegetarian: true },
    { name: 'Begun Bhaji', category: 'Side Dish', price: 70, prepTime: 20, calories: 120, spiciness: 'Medium', isVegetarian: true },
    { name: 'Raita', category: 'Side Dish', price: 50, prepTime: 10, calories: 80, spiciness: 'None', isVegetarian: true },
    
    // Desserts
    { name: 'Payesh', category: 'Dessert', price: 150, prepTime: 60, calories: 350, spiciness: 'None', isVegetarian: true },
    { name: 'Mishti Doi', category: 'Dessert', price: 120, prepTime: 30, calories: 280, spiciness: 'None', isVegetarian: true },
    { name: 'Rosogolla', category: 'Dessert', price: 100, prepTime: 40, calories: 250, spiciness: 'None', isVegetarian: true },
    { name: 'Gulab Jamun', category: 'Dessert', price: 130, prepTime: 45, calories: 300, spiciness: 'None', isVegetarian: true },
  ]

  const descriptions = [
    'Authentic Bengali recipe made with love and care.',
    'Traditional home-style cooking with fresh ingredients.',
    'A family favorite passed down through generations.',
    'Expertly crafted with aromatic spices.',
    'Perfect blend of flavors and textures.',
    'Made fresh daily with premium ingredients.',
    'Chef\'s special recipe that customers love.',
    'Classic dish prepared the traditional way.',
    'Comfort food at its finest.',
    'Delicious and satisfying every time.',
  ]

  const allDishes: any[] = []

  for (const kitchen of kitchens) {
    const seller = sellers.find(s => s.id === kitchen.sellerId)!
    
    // Each kitchen gets 12 dishes (mix of different types)
    const kitchenDishes = pickRandom(dishTemplates, 12)
    
    for (const dishTemplate of kitchenDishes) {
      const dish = await prisma.menu_items.create({
        data: {
          chef_id: seller.id,
          name: `${dishTemplate.name}`,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          category: dishTemplate.category,
          price: generatePrice(dishTemplate.price - 25, dishTemplate.price + 25),
          prepTime: dishTemplate.prepTime,
          calories: dishTemplate.calories,
          spiciness: dishTemplate.spiciness,
          isVegetarian: dishTemplate.isVegetarian,
          isAvailable: Math.random() > 0.1, // 90% available
          rating: randomRating(3.8, 5.0),
          reviewCount: Math.floor(Math.random() * 30),
          updatedAt: new Date(),
          menu_item_images: {
            create: [
              {
                imageUrl: getDishImage(dishTemplate.name),
                order: 0,
              },
            ],
          },
          ingredients: {
            create: [
              { name: 'Rice/Main Ingredient', quantity: 500, unit: 'g', cost: 60 },
              { name: 'Spices Mix', quantity: 50, unit: 'g', cost: 20 },
              { name: 'Oil/Ghee', quantity: 50, unit: 'ml', cost: 30 },
            ],
          },
        },
      })
      allDishes.push(dish)
    }
    
    console.log(`✅ Created ${kitchenDishes.length} dishes for ${kitchen.name}`)
  }

  // ==================== STEP 3: Create Subscription Plans ====================
  console.log('\n📦 Creating subscription plans...')

  const planTemplates = [
    {
      name: 'Daily Lunch Plan',
      mealsPerDay: 1,
      servingsPerMeal: 1,
      price: 4500,
      description: 'Get a delicious lunch delivered every day. Perfect for working professionals.',
    },
    {
      name: 'Full Day Meal Plan',
      mealsPerDay: 3,
      servingsPerMeal: 1,
      price: 9500,
      description: 'Breakfast, lunch, and dinner covered. Complete nutrition for the whole day.',
    },
    {
      name: 'Family Dinner Plan',
      mealsPerDay: 1,
      servingsPerMeal: 4,
      price: 12000,
      description: 'Dinner for a family of 4. No more cooking stress after a long day.',
    },
  ]

  const allPlans: any[] = []

  for (const kitchen of kitchens) {
    // Each kitchen gets 2-3 plans
    const numPlans = 2 + Math.floor(Math.random() * 2)
    const kitchenPlans = pickRandom(planTemplates, numPlans)
    
    for (const planTemplate of kitchenPlans) {
      // Get some dishes from this kitchen for the weekly schedule
      const kitchenDishes = allDishes.filter(d => {
        const seller = sellers.find(s => s.id === kitchen.sellerId)
        return d.chef_id === seller?.id
      })
      
      const weeklySchedule = createWeeklySchedule(kitchenDishes, planTemplate.mealsPerDay)
      
      const plan = await prisma.subscription_plans.create({
        data: {
          kitchen_id: kitchen.id,
          name: planTemplate.name,
          description: planTemplate.description,
          price: generatePrice(planTemplate.price - 50, planTemplate.price + 50),
          meals_per_day: planTemplate.mealsPerDay,
          servings_per_meal: planTemplate.servingsPerMeal,
          is_active: true,
          subscriber_count: Math.floor(Math.random() * 20),
          monthly_revenue: generatePrice(5000, 10000),
          rating: randomRating(4.0, 5.0),
          calories: 600 * planTemplate.mealsPerDay,
          protein: '30g',
          carbs: '80g',
          fats: '20g',
          chef_quote: 'Made with love and fresh ingredients daily!',
          cover_image: getPlanCoverImage(),
          weekly_schedule: weeklySchedule,
        },
      })
      allPlans.push(plan)
    }
    
    console.log(`✅ Created subscription plans for ${kitchen.name}`)
  }

  // ==================== STEP 4: Create 25 Customers ====================
  console.log('\n👥 Creating 25 customers...')

  const firstNames = ['Rahim', 'Karim', 'Jamal', 'Farhan', 'Imran', 'Sadiq', 'Tanvir', 'Rashid', 'Habib', 'Nasir', 'Ayesha', 'Fatima', 'Zara', 'Nadia', 'Samira', 'Lubna', 'Sadia', 'Rabia', 'Amina', 'Mariam', 'Tasnim', 'Farah', 'Sabrina', 'Riya', 'Priya']
  const lastNames = ['Rahman', 'Ahmed', 'Khan', 'Islam', 'Hossain', 'Ali', 'Begum', 'Akter', 'Uddin', 'Chowdhury']
  
  const customers: any[] = []

  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[i]
    const lastName = lastNames[i % lastNames.length]
    const fullName = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@customer.com`
    
    const coords = generateDhakaCoordinates()
    
    const customer = await prisma.user.create({
      data: {
        id: `customer_${Math.random().toString(36).substring(7)}`,
        name: fullName,
        email: email,
        password: hashedPassword,
        role: 'BUYER',
        emailVerified: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
        addresses: {
          create: {
            label: 'Home',
            address: `House ${10 + i}, Road ${5 + (i % 10)}, Dhaka`,
            zone: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mohammadpur'][i % 5],
            latitude: coords.latitude,
            longitude: coords.longitude,
            isDefault: true,
          },
        },
      },
    })
    customers.push(customer)
  }
  
  console.log(`✅ Created 25 customers`)

  // ==================== STEP 5: Create Orders ====================
  console.log('\n🛒 Creating orders...')

  const orderStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'DELIVERING', 'PREPARING', 'CONFIRMED']
  let totalOrders = 0

  // Each customer makes 2-5 orders
  for (const customer of customers) {
    const numOrders = 2 + Math.floor(Math.random() * 4) // 2-5 orders
    
    for (let i = 0; i < numOrders; i++) {
      // Pick a random kitchen
      const kitchen = kitchens[Math.floor(Math.random() * kitchens.length)]
      
      // Get dishes from this kitchen
      const kitchenSeller = sellers.find(s => s.id === kitchen.sellerId)
      const kitchenDishes = allDishes.filter(d => d.chef_id === kitchenSeller?.id)
      
      // Order 1-4 dishes
      const numDishes = 1 + Math.floor(Math.random() * 4)
      const orderedDishes = pickRandom(kitchenDishes, numDishes)
      
      const orderItems = orderedDishes.map(dish => ({
        menuItemId: dish.id,
        quantity: 1 + Math.floor(Math.random() * 3), // 1-3 quantity
        price: dish.price,
      }))
      
      const total = roundPriceToEndDigits(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))
      
      // Order created 1-30 days ago
      const daysAgo = Math.floor(Math.random() * 30) + 1
      const orderDate = new Date()
      orderDate.setDate(orderDate.getDate() - daysAgo)
      
      // Delivery date is 1-2 days after order for completed, or future for pending
      const deliveryDate = new Date(orderDate)
      deliveryDate.setDate(deliveryDate.getDate() + (Math.random() > 0.5 ? 1 : 2))
      
      const mealSlots = ['BREAKFAST', 'LUNCH', 'DINNER']
      const deliveryTimeSlot = mealSlots[Math.floor(Math.random() * mealSlots.length)]
      
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
      
      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          kitchenId: kitchen.id,
          total: total,
          status: status as any,
          delivery_date: deliveryDate,
          delivery_time_slot: deliveryTimeSlot as any,
          notes: Math.random() > 0.7 ? 'Please deliver before 2 PM' : null,
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: orderItems,
          },
        },
      })
      
      totalOrders++
      
      // If order is completed, create reviews for each dish (80% chance)
      if (status === 'COMPLETED' && Math.random() > 0.2) {
        for (const item of orderItems) {
          const reviewTexts = [
            'Absolutely delicious! Will order again.',
            'Great taste and portion size. Highly recommend!',
            'Good food, but could use a bit more spice.',
            'Excellent quality and packaging. Very satisfied.',
            'Amazing flavors! Just like homemade.',
            'Pretty good, but delivery was a bit slow.',
            'Fantastic meal! Worth every taka.',
            'Nice food, fresh ingredients used.',
            'Loved it! The chef really knows their craft.',
            'Good value for money. Will be a regular customer.',
            'Delicious and authentic taste.',
            'Very tasty! Perfectly cooked.',
            'Great experience overall. Food was hot and fresh.',
            'Enjoyed every bite! Highly recommended.',
            'Good food but portion could be bigger.',
          ]
          
          try {
            await prisma.review.create({
              data: {
                userId: customer.id,
                menuItemId: item.menuItemId,
                orderId: order.id,
                rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
                comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
                createdAt: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after order
              },
            })
          } catch (e) {
            // Skip if review already exists
          }
        }
      }
    }
  }
  
  console.log(`✅ Created ${totalOrders} orders with reviews`)

  // ==================== STEP 6: Ensure at least 10 reviews per dish ====================
  console.log('\n⭐ Ensuring minimum 10 reviews per dish...')
  
  const reviewTexts = [
    'Absolutely delicious! Will order again.',
    'Great taste and portion size. Highly recommend!',
    'Good food, but could use a bit more spice.',
    'Excellent quality and packaging. Very satisfied.',
    'Amazing flavors! Just like homemade.',
    'Pretty good, but delivery was a bit slow.',
    'Fantastic meal! Worth every taka.',
    'Nice food, fresh ingredients used.',
    'Loved it! The chef really knows their craft.',
    'Good value for money. Will be a regular customer.',
    'Delicious and authentic taste.',
    'Very tasty! Perfectly cooked.',
    'Great experience overall. Food was hot and fresh.',
    'Enjoyed every bite! Highly recommended.',
    'Good food but portion could be bigger.',
    'Perfectly spiced, just the way I like it.',
    'Can\'t wait to order again!',
    'Reminded me of home-cooked meals.',
    'Best meal I\'ve had this month.',
    'Quality is unmatched in this price range.',
  ]
  
  let reviewsAdded = 0
  
  for (const dish of allDishes) {
    // Count existing reviews
    const existingReviews = await prisma.review.count({
      where: { menuItemId: dish.id }
    })
    
    if (existingReviews < 10) {
      // Need to add more reviews
      const reviewsNeeded = 10 - existingReviews
      
      for (let i = 0; i < reviewsNeeded; i++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
        const randomOrder = await prisma.order.findFirst({
          where: {
            userId: randomCustomer.id,
            status: 'COMPLETED',
          },
        })
        
        if (randomOrder) {
          try {
            await prisma.review.create({
              data: {
                userId: randomCustomer.id,
                menuItemId: dish.id,
                orderId: randomOrder.id,
                rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
                comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
                createdAt: new Date(randomOrder.createdAt.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
              },
            })
            reviewsAdded++
          } catch (e) {
            // Skip if review already exists
          }
        }
      }
    }
  }
  
  console.log(`✅ Added ${reviewsAdded} additional reviews`)

  // ==================== STEP 7: Create Subscriptions ====================
  console.log('\n📅 Creating user subscriptions...')

  let totalSubscriptions = 0
  
  // 15 customers subscribe to plans
  const subscribingCustomers = pickRandom(customers, 15)
  
  for (const customer of subscribingCustomers) {
    // Each subscribing customer gets 1-2 subscriptions
    const numSubscriptions = 1 + Math.floor(Math.random() * 2)
    
    for (let i = 0; i < numSubscriptions; i++) {
      const plan = allPlans[Math.floor(Math.random() * allPlans.length)]
      const kitchen = kitchens.find(k => k.id === plan.kitchen_id)!
      
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 20)) // Started 0-20 days ago
      
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1) // 1 month subscription
      
      const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING', 'PAUSED']
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      await prisma.user_subscriptions.create({
        data: {
          userId: customer.id,
          planId: plan.id,
          kitchenId: kitchen.id,
          status: status as any,
          startDate: startDate,
          endDate: endDate,
          deliveryInstructions: Math.random() > 0.7 ? 'Please call before delivery' : null,
          useChefContainers: Math.random() > 0.3,
          monthlyPrice: plan.price,
          deliveryFee: 50,
          discount: Math.random() > 0.7 ? generatePrice(100, 500) : 0,
          totalAmount: plan.price + 50,
          confirmedAt: status === 'ACTIVE' ? startDate : null,
        },
      })
      
      totalSubscriptions++
    }
  }
  
  console.log(`✅ Created ${totalSubscriptions} subscriptions`)

  // ==================== Summary ====================
  console.log('\n' + '='.repeat(50))
  console.log('🎉 Seeding completed successfully!')
  console.log('='.repeat(50))
  console.log(`👨‍🍳 Sellers/Chefs: ${sellers.length}`)
  console.log(`🏪 Kitchens: ${kitchens.length}`)
  console.log(`🍽️  Dishes: ${allDishes.length}`)
  console.log(`📦 Subscription Plans: ${allPlans.length}`)
  console.log(`👥 Customers: ${customers.length}`)
  console.log(`🛒 Orders: ${totalOrders}`)
  console.log(`📅 Subscriptions: ${totalSubscriptions}`)
  console.log('='.repeat(50))
  console.log('\n📝 Login Credentials:')
  console.log(`   Password (all users): ${commonPassword}`)
  console.log('\n💡 Example emails:')
  console.log('   Chef: fatima.rahman@ghorerkhabar.com')
  console.log('   Customer: rahim.rahman0@customer.com')
  console.log('='.repeat(50) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

