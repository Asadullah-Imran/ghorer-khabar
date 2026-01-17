import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { config } from 'dotenv'
import pg from 'pg'

config()

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding inventory items...')

  // Placeholder User ID - REPLACE THIS WITH A REAL SELLER/CHEF USER ID FROM YOUR DATABASE
  const SELLER_ID = process.env.TEMP_Seller_ID || "6d7c0ce7-7317-4c07-90f5-ff6b8ce0497e"

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
    console.error(`❌ Seller/Chef with ID ${SELLER_ID} not found!`)
    console.log('Please update SELLER_ID in the seed file or set TEMP_Seller_ID env variable')
    process.exit(1)
  }

  console.log(`✅ Found seller: ${seller.name} (ID: ${seller.id})`)

  const inventoryItems = [
    // Grains & Rice
    {
      name: "Basmati Rice",
      unit: "kg",
      currentStock: 50,
      demandFromOrders: 15,
      forecastDemand: 20,
      reorderLevel: 30,
      unitCost: 120
    },
    {
      name: "Chinigura Rice",
      unit: "kg",
      currentStock: 40,
      demandFromOrders: 12,
      forecastDemand: 18,
      reorderLevel: 25,
      unitCost: 100
    },
    {
      name: "Wheat Flour",
      unit: "kg",
      currentStock: 30,
      demandFromOrders: 8,
      forecastDemand: 12,
      reorderLevel: 20,
      unitCost: 60
    },
    {
      name: "Moong Dal",
      unit: "kg",
      currentStock: 20,
      demandFromOrders: 5,
      forecastDemand: 8,
      reorderLevel: 15,
      unitCost: 150
    },
    {
      name: "Masoor Dal",
      unit: "kg",
      currentStock: 18,
      demandFromOrders: 4,
      forecastDemand: 6,
      reorderLevel: 12,
      unitCost: 140
    },

    // Proteins
    {
      name: "Chicken (Dressed)",
      unit: "kg",
      currentStock: 35,
      demandFromOrders: 20,
      forecastDemand: 25,
      reorderLevel: 25,
      unitCost: 280
    },
    {
      name: "Mutton",
      unit: "kg",
      currentStock: 25,
      demandFromOrders: 15,
      forecastDemand: 18,
      reorderLevel: 20,
      unitCost: 850
    },
    {
      name: "Eggs",
      unit: "dozen",
      currentStock: 40,
      demandFromOrders: 12,
      forecastDemand: 15,
      reorderLevel: 30,
      unitCost: 180
    },
    {
      name: "Paneer",
      unit: "kg",
      currentStock: 15,
      demandFromOrders: 8,
      forecastDemand: 10,
      reorderLevel: 12,
      unitCost: 450
    },
    {
      name: "Hilsa Fish",
      unit: "kg",
      currentStock: 12,
      demandFromOrders: 8,
      forecastDemand: 12,
      reorderLevel: 10,
      unitCost: 550
    },

    // Vegetables
    {
      name: "Onion (Red)",
      unit: "kg",
      currentStock: 60,
      demandFromOrders: 25,
      forecastDemand: 30,
      reorderLevel: 40,
      unitCost: 45
    },
    {
      name: "Potato",
      unit: "kg",
      currentStock: 80,
      demandFromOrders: 30,
      forecastDemand: 35,
      reorderLevel: 50,
      unitCost: 35
    },
    {
      name: "Tomato",
      unit: "kg",
      currentStock: 40,
      demandFromOrders: 18,
      forecastDemand: 22,
      reorderLevel: 30,
      unitCost: 55
    },
    {
      name: "Garlic",
      unit: "kg",
      currentStock: 8,
      demandFromOrders: 3,
      forecastDemand: 5,
      reorderLevel: 6,
      unitCost: 250
    },
    {
      name: "Ginger",
      unit: "kg",
      currentStock: 6,
      demandFromOrders: 2,
      forecastDemand: 3,
      reorderLevel: 4,
      unitCost: 200
    },

    // Spices (in grams)
    {
      name: "Cumin Seeds",
      unit: "g",
      currentStock: 500,
      demandFromOrders: 50,
      forecastDemand: 75,
      reorderLevel: 300,
      unitCost: 8
    },
    {
      name: "Coriander Seeds",
      unit: "g",
      currentStock: 600,
      demandFromOrders: 60,
      forecastDemand: 80,
      reorderLevel: 350,
      unitCost: 6
    },
    {
      name: "Turmeric Powder",
      unit: "g",
      currentStock: 400,
      demandFromOrders: 40,
      forecastDemand: 60,
      reorderLevel: 250,
      unitCost: 4
    },
    {
      name: "Red Chili Powder",
      unit: "g",
      currentStock: 300,
      demandFromOrders: 35,
      forecastDemand: 50,
      reorderLevel: 200,
      unitCost: 5
    },
    {
      name: "Garam Masala",
      unit: "g",
      currentStock: 250,
      demandFromOrders: 30,
      forecastDemand: 45,
      reorderLevel: 150,
      unitCost: 10
    },

    // Dairy
    {
      name: "Whole Milk",
      unit: "liter",
      currentStock: 100,
      demandFromOrders: 40,
      forecastDemand: 50,
      reorderLevel: 60,
      unitCost: 80
    },
    {
      name: "Yogurt/Curd",
      unit: "kg",
      currentStock: 30,
      demandFromOrders: 12,
      forecastDemand: 15,
      reorderLevel: 20,
      unitCost: 120
    },
    {
      name: "Cream",
      unit: "ml",
      currentStock: 500,
      demandFromOrders: 150,
      forecastDemand: 200,
      reorderLevel: 300,
      unitCost: 5
    },
    {
      name: "Ghee",
      unit: "kg",
      currentStock: 8,
      demandFromOrders: 2,
      forecastDemand: 3,
      reorderLevel: 5,
      unitCost: 650
    },

    // Oils & Condiments
    {
      name: "Mustard Oil",
      unit: "liter",
      currentStock: 20,
      demandFromOrders: 5,
      forecastDemand: 8,
      reorderLevel: 12,
      unitCost: 120
    },
    {
      name: "Cooking Oil",
      unit: "liter",
      currentStock: 50,
      demandFromOrders: 15,
      forecastDemand: 20,
      reorderLevel: 30,
      unitCost: 95
    },
    {
      name: "Butter",
      unit: "kg",
      currentStock: 10,
      demandFromOrders: 3,
      forecastDemand: 4,
      reorderLevel: 6,
      unitCost: 550
    },
    {
      name: "Mustard Paste",
      unit: "kg",
      currentStock: 5,
      demandFromOrders: 1,
      forecastDemand: 2,
      reorderLevel: 3,
      unitCost: 300
    },

    // Dry Goods
    {
      name: "Lentils (Mixed)",
      unit: "kg",
      currentStock: 15,
      demandFromOrders: 4,
      forecastDemand: 6,
      reorderLevel: 10,
      unitCost: 140
    },
    {
      name: "Cashews",
      unit: "g",
      currentStock: 200,
      demandFromOrders: 40,
      forecastDemand: 60,
      reorderLevel: 100,
      unitCost: 300
    },
    {
      name: "Raisins",
      unit: "g",
      currentStock: 150,
      demandFromOrders: 30,
      forecastDemand: 45,
      reorderLevel: 80,
      unitCost: 80
    },
    {
      name: "Saffron",
      unit: "g",
      currentStock: 2,
      demandFromOrders: 0.5,
      forecastDemand: 1,
      reorderLevel: 1.5,
      unitCost: 1000
    }
  ]

  console.log(`\n📝 Creating ${inventoryItems.length} inventory items...\n`)

  let createdCount = 0
  for (const item of inventoryItems) {
    try {
      const inventoryItem = await prisma.inventory_items.create({
        data: {
          chef_id: SELLER_ID,
          name: item.name,
          unit: item.unit,
          currentStock: item.currentStock,
          demandFromOrders: item.demandFromOrders,
          forecastDemand: item.forecastDemand,
          reorderLevel: item.reorderLevel,
          unitCost: item.unitCost,
        },
      })

      createdCount++
      console.log(`✅ Created: ${inventoryItem.name}`)
      console.log(`   - Unit: ${inventoryItem.unit}`)
      console.log(`   - Current Stock: ${inventoryItem.currentStock}`)
      console.log(`   - Unit Cost: ৳${inventoryItem.unitCost}`)
      console.log(`   - Reorder Level: ${inventoryItem.reorderLevel}`)
      console.log(`   - Total Value: ৳${(inventoryItem.currentStock * inventoryItem.unitCost).toFixed(0)}\n`)
    } catch (error) {
      console.error(`❌ Error creating item "${item.name}":`, error)
    }
  }

  console.log(`\n🎉 Seeding completed!`)
  console.log(`   - Total items created: ${createdCount}/${inventoryItems.length}`)
  console.log(`   - Seller ID: ${SELLER_ID}`)
  console.log(`\n💡 Next steps:`)
  console.log(`   - Review inventory in your dashboard`)
  console.log(`   - Update stock levels as needed`)
  console.log(`   - Monitor reorder alerts`)
  console.log(`   - Track procurement costs\n`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
