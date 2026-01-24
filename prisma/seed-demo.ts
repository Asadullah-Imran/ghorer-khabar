import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import pg from 'pg'
import { OrderStatus, PrismaClient } from '../generated/prisma/client'

config()

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ==================== 🎯 CONFIGURATION ====================
// ⚠️ ENSURE THESE IDs EXIST IN YOUR DATABASE BEFORE RUNNING
const TARGET_USER_ID = '2a525f3d-9894-467b-bca9-e46a62903fab' // Asadullah Imran
const TARGET_CHEF_ID = 'c13f16e2-88b5-4b06-bd79-550a264b1c06' // Astro
const TARGET_KITCHEN_ID = 'cmks22pil00015d95ebevvcbj' // Asad's Kitchen

const OTHER_CUSTOMERS = [
  'customer_u5wupv', 'customer_rge4m', 'customer_8wrwgm', 'customer_01q68j',
  'customer_10iymt', 'customer_tfd2pw', 'customer_zei4lc', 'customer_qstfcl',
  'customer_kd766t', 'customer_qwnxm', 'customer_b5tmw5', 'customer_dc2ua'
]

async function main() {
  console.log('🚀 Starting Specialized Demo Seed...')
  console.log(`🎯 Target Chef: ${TARGET_CHEF_ID}`)
  console.log(`🎯 Target User: ${TARGET_USER_ID}`)

  // ==================== STEP 1: CLEANUP TARGET DATA ====================
  console.log('🧹 Cleaning previous orders and inventory for target kitchen...')
  await prisma.review.deleteMany({ where: { order: { kitchenId: TARGET_KITCHEN_ID } } }) // Clean reviews first
  await prisma.order.deleteMany({ where: { kitchenId: TARGET_KITCHEN_ID } })
  await prisma.inventory_items.deleteMany({ where: { chef_id: TARGET_CHEF_ID } }) // Reset Inventory
  await prisma.menu_items.deleteMany({ where: { chef_id: TARGET_CHEF_ID, name: { not: 'Fish' } } }) 

  // ==================== STEP 2: ENRICH MENU ====================
  console.log('🍽️  Enriching menu for Asad\'s Kitchen...')
  
  const newDishes = [
    {
      name: "Special Kacchi Biryani",
      price: 450,
      category: "Main Course",
      description: "Signature mutton biryani with aromatic basmati rice.",
      ingredients: [
        { name: "Basmati Rice", quantity: 0.25, unit: "kg", cost: 120 },
        { name: "Mutton", quantity: 0.20, unit: "kg", cost: 850 },
        { name: "Potatoes", quantity: 0.10, unit: "kg", cost: 40 }
      ]
    },
    {
      name: "Beef Bhuna",
      price: 380,
      category: "Main Course",
      description: "Spicy beef curry slow-cooked to perfection.",
      ingredients: [
        { name: "Beef", quantity: 0.25, unit: "kg", cost: 750 },
        { name: "Onions", quantity: 0.15, unit: "kg", cost: 80 },
        { name: "Spices Mix", quantity: 0.05, unit: "pkt", cost: 50 }
      ]
    },
    {
      name: "Plain Polao & Chicken Roast",
      price: 320,
      category: "Main Course",
      description: "Classic combination for lunch.",
      ingredients: [
        { name: "Chinigura Rice", quantity: 0.20, unit: "kg", cost: 110 },
        { name: "Chicken", quantity: 0.25, unit: "kg", cost: 220 },
        { name: "Yogurt", quantity: 0.05, unit: "kg", cost: 100 }
      ]
    },
    {
      name: "Shorshe Ilish",
      price: 550,
      category: "Main Course",
      description: "Hilsa fish in mustard sauce.",
      ingredients: [
        { name: "Hilsa Fish", quantity: 1, unit: "pc", cost: 400 },
        { name: "Mustard Paste", quantity: 0.05, unit: "kg", cost: 60 }
      ]
    }
  ]

  const createdDishes = []
  
  for (const dish of newDishes) {
    const created = await prisma.menu_items.create({
      data: {
        chef_id: TARGET_CHEF_ID,
        name: dish.name,
        description: dish.description,
        category: dish.category,
        price: dish.price,
        isAvailable: true,
        rating: 4.5,
        reviewCount: 0,
        updatedAt: new Date(),
        menu_item_images: {
          create: { imageUrl: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=600", order: 0 }
        },
        ingredients: {
          create: dish.ingredients
        }
      },
      include: { ingredients: true } // Include ingredients in result
    })
    createdDishes.push(created)
  }
  
  // ==================== STEP 2.5: SYNC INVENTORY (NEW) ====================
  // Initialize inventory so the Shopping List has data to display
  console.log('📦 Initializing Inventory Tracking...')
  
  const allIngredients = new Set()
  
  for (const dish of createdDishes) {
    for (const ing of dish.ingredients) {
      // Check if we already added this ingredient to inventory (avoid duplicates)
      // Note: In real app, ingredients are unique, here we simplify for seed
      await prisma.inventory_items.create({
        data: {
          chef_id: TARGET_CHEF_ID,
          name: ing.name,
          unit: ing.unit,
          currentStock: Math.random() * 2, // Low stock (0-2kg) to trigger "Shopping List"
          reorderLevel: 5,
          unitCost: ing.cost || 0,
          demandFromOrders: 0, // Will be calculated by ML service
          forecastDemand: 0    // Will be calculated by ML service
        }
      })
    }
  }

  // ==================== STEP 3: GENERATE HISTORY ====================
  console.log('📈 Generating 30-day order history...')
  
  const today = new Date('2026-01-25T02:13:00')
  const historyDays = 30
  let totalOrders = 0

  for (let i = historyDays; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Trend Logic: Growth + Weekend Spikes
    const isWeekend = date.getDay() === 5 || date.getDay() === 6
    const baseVolume = 3 + Math.floor(((historyDays - i) / historyDays) * 8)
    const dailyCount = Math.floor(baseVolume * (isWeekend ? 1.5 : 1.0) + Math.random() * 3)

    // Log progress every 5 days to reduce clutter
    if (i % 5 === 0) console.log(`   📅 Day -${i}: Generating ~${dailyCount} orders...`)

    for (let j = 0; j < dailyCount; j++) {
      const isTargetUser = Math.random() > 0.8
      // Fallback to target user if other customers array is empty or undefined
      const customerId = isTargetUser || OTHER_CUSTOMERS.length === 0 
        ? TARGET_USER_ID 
        : OTHER_CUSTOMERS[Math.floor(Math.random() * OTHER_CUSTOMERS.length)]
      
      // Recent orders (Today/Yesterday) = PENDING/CONFIRMED (For Shopping List)
      // Old orders = COMPLETED (For Forecast & NLP)
      let status: OrderStatus = 'COMPLETED'
      if (i <= 1) {
        status = Math.random() > 0.5 ? 'CONFIRMED' : 'PENDING'
      }

      const numItems = 1 + Math.floor(Math.random() * 3)
      const selectedDishes = []
      let orderTotal = 0
      
      for (let k = 0; k < numItems; k++) {
        const dish = createdDishes[Math.floor(Math.random() * createdDishes.length)]
        selectedDishes.push({
          menuItemId: dish.id,
          quantity: 1 + Math.floor(Math.random() * 2),
          price: dish.price
        })
        orderTotal += dish.price
      }

      const order = await prisma.order.create({
        data: {
          userId: customerId,
          kitchenId: TARGET_KITCHEN_ID,
          total: orderTotal,
          status: status,
          delivery_date: date,
          delivery_time_slot: 'LUNCH',
          createdAt: date,
          updatedAt: date,
          items: { create: selectedDishes }
        }
      })
      totalOrders++

      // ==================== STEP 4: GENERATE REVIEWS ====================
      if (status === 'COMPLETED' && Math.random() > 0.4) {
        let reviewComment = ""
        let rating = 5

        if (customerId === TARGET_USER_ID) {
          reviewComment = "Absolutely delicious! The taste was authentic and the meat was tender."
          rating = 5
        } else {
          const issues = [
            "Food was good but the packaging leaked oil everywhere.",
            "Delivery was very late, waited 2 hours.",
            "The quantity was too less for the price.",
            "Tasty but too oily.",
            "Great food, loved the spices!"
          ]
          reviewComment = issues[Math.floor(Math.random() * issues.length)]
          rating = reviewComment.includes("Great") ? 5 : 3
        }

        try {
          await prisma.review.create({
            data: {
              userId: customerId,
              menuItemId: selectedDishes[0].menuItemId,
              orderId: order.id,
              rating: rating,
              comment: reviewComment,
              createdAt: date
            }
          })
        } catch (e) { /* Ignore dups */ }
      }
    }
  }

  console.log(`\n✅ Generated ${totalOrders} orders for Asad's Kitchen over 30 days.`)
  console.log(`✅ Reviews generated with mixed sentiment (Packaging vs Taste).`)
  console.log(`✅ Inventory Initialized & Pending orders created for Shopping List.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })