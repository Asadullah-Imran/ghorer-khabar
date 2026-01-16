import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaClient } from '@prisma/client'
import { PrismaClient, Prisma } from '../generated/prisma/client'
import { config } from 'dotenv'
import pg from 'pg'

config()

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Placeholder User ID - REPLACE THIS WITH A REAL USER ID FROM YOUR DATABASE
  const SELLER_ID = "d39642d9-457b-4526-a76b-3509251ac48b" 

  const menuItems = [
    {
      name: "Hyderabadi Chicken Biryani",
      description: "Authentic Hyderabadi Dum Biryani cooked with basmati rice, tender chicken, and aromatic spices.",
      category: "Main Course",
      price: 350,
      prepTime: 45,
      calories: 800,
      spiciness: "Medium",
      isVegetarian: false,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=2000&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Basmati Rice", quantity: 500, unit: "g" },
        { name: "Chicken", quantity: 500, unit: "g" },
        { name: "Yogurt", quantity: 200, unit: "ml" },
        { name: "Saffron", quantity: 1, unit: "pinch" }
      ]
    },
    {
      name: "Beef Bhuna Khichuri",
      description: "Traditional Bengali Beef Khichuri prepared with moong dal, chinigura rice, and succulent beef chunks.",
      category: "Main Course",
      price: 420,
      prepTime: 50,
      calories: 950,
      spiciness: "High",
      isVegetarian: false,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Chinigura Rice", quantity: 400, unit: "g" },
        { name: "Moong Dal", quantity: 250, unit: "g" },
        { name: "Beef", quantity: 500, unit: "g" }
      ]
    },
    {
      name: "Shorshe Ilish",
      description: "Hilsa fish cooked in a pungent mustard sauce, a classic delicacy of Bengal.",
      category: "Main Course",
      price: 650,
      prepTime: 40,
      calories: 600,
      spiciness: "High",
      isVegetarian: false,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1695287518465-27a36cb76742?q=80&w=1964&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Hilsa Fish", quantity: 2, unit: "pcs" },
        { name: "Mustard Paste", quantity: 50, unit: "g" },
        { name: "Green Chilies", quantity: 4, unit: "pcs" }
      ]
    },
    {
      name: "Aloo Paratha with Curd",
      description: "Stuffed potato flatbread served with fresh curd and pickles. Perfect for breakfast.",
      category: "Breakfast",
      price: 120,
      prepTime: 25,
      calories: 450,
      spiciness: "Mild",
      isVegetarian: true,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1974&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Wheat Flour", quantity: 200, unit: "g" },
        { name: "Potato", quantity: 2, unit: "pcs" },
        { name: "Curd", quantity: 100, unit: "ml" }
      ]
    },
    {
      name: "Kachi Biryani",
      description: "Raw marinated mutton cooked together with aromatic rice in the 'dum' style.",
      category: "Main Course",
      price: 550,
      prepTime: 120,
      calories: 1200,
      spiciness: "Medium",
      isVegetarian: false,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2070&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Mutton", quantity: 1000, unit: "g" },
        { name: "Basmati Rice", quantity: 800, unit: "g" },
        { name: "Ghee", quantity: 100, unit: "ml" }
      ]
    },
    {
      name: "Chicken Korma",
      description: "Mild and creamy chicken curry cooked with yogurt, cream, and nuts.",
      category: "Main Course",
      price: 280,
      prepTime: 40,
      calories: 550,
      spiciness: "Mild",
      isVegetarian: false,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1968&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Chicken", quantity: 500, unit: "g" },
        { name: "Cream", quantity: 50, unit: "ml" },
        { name: "Cashews", quantity: 20, unit: "g" }
      ]
    },
    {
      name: "Vegetable Khichuri",
      description: "Comforting rice and lentil dish cooked with seasonal vegetables.",
      category: "Main Course",
      price: 180,
      prepTime: 35,
      calories: 400,
      spiciness: "Medium",
      isVegetarian: true,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=2035&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Rice", quantity: 200, unit: "g" },
        { name: "Lentils", quantity: 100, unit: "g" },
        { name: "Mixed Veggies", quantity: 200, unit: "g" }
      ]
    },
    {
      name: "Rui Macher Doipiaza",
      description: "Rui fish curry prepared with lots of onions and tomatoes.",
      category: "Main Course",
      price: 250,
      prepTime: 40,
      calories: 450,
      spiciness: "Medium",
      isVegetarian: false,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=2070&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Rui Fish", quantity: 2, unit: "pcs" },
        { name: "Onions", quantity: 100, unit: "g" }
      ]
    },
    {
      name: "Daal Butter Fry",
      description: "Rich and creamy yellow lentils tempered with butter and garlic.",
      category: "Side Dish",
      price: 100,
      prepTime: 20,
      calories: 200,
      spiciness: "Mild",
      isVegetarian: true,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1511914678378-2906b1f69dcf?q=80&w=1974&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Yellow Dal", quantity: 150, unit: "g" },
        { name: "Butter", quantity: 20, unit: "g" }
      ]
    },
    {
      name: "Payesh",
      description: "Traditional Bengali rice pudding made with milk, sugar, and nuts.",
      category: "Dessert",
      price: 150,
      prepTime: 60,
      calories: 350,
      spiciness: "None",
      isVegetarian: true,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1695287518465-27a36cb76742?q=80&w=1964&auto=format&fit=crop"
      ],
      ingredients: [
        { name: "Milk", quantity: 500, unit: "ml" },
        { name: "Rice", quantity: 50, unit: "g" },
        { name: "Sugar", quantity: 100, unit: "g" }
      ]
    }
  ];

  console.log(`Starting seed for sellerId: ${SELLER_ID}...`)

  for (const item of menuItems) {
    const menuItem = await prisma.menu_items.create({
      data: {
        chef_id: SELLER_ID,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        prepTime: item.prepTime,
        calories: item.calories,
        spiciness: item.spiciness,
        isVegetarian: item.isVegetarian,
        isAvailable: item.isAvailable,
        rating: 0,
        reviewCount: 0,
        updatedAt: new Date(),
        // Create related images
        menu_item_images: {
          create: item.images.map((url, index) => ({
            imageUrl: url,
            order: index
          }))
        },
        // Create related ingredients
        ingredients: {
          create: item.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit
          }))
        }
      }
    })
    console.log(`Created menu item: ${menuItem.name}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




  