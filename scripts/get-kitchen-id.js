const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function getKitchenId() {
  try {
    const kitchens = await prisma.kitchen.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        sellerId: true,
      },
    });

    console.log("\n📦 Available Kitchens:");
    console.log(JSON.stringify(kitchens, null, 2));

    if (kitchens.length === 0) {
      console.log("\n⚠️  No kitchens found. You need to create a kitchen first.");
    } else {
      console.log(`\n✅ Update your .env file with:\nTEMP_KITCHEN_ID="${kitchens[0].id}"`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getKitchenId();
