/**
 * Script to check operatingDays in the database
 * Run with: npx tsx scripts/check-operating-days.ts
 */

import { prisma } from "../src/lib/prisma/prisma";

async function checkOperatingDays() {
  try {
    console.log("Checking all kitchens and their operatingDays...\n");

    const kitchens = await prisma.kitchen.findMany({
      select: {
        id: true,
        name: true,
        sellerId: true,
        operatingDays: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log(`Found ${kitchens.length} kitchens\n`);

    for (const kitchen of kitchens) {
      console.log(`Kitchen: ${kitchen.name} (ID: ${kitchen.id})`);
      console.log(`Seller ID: ${kitchen.sellerId}`);
      console.log(`Last Updated: ${kitchen.updatedAt}`);
      console.log(`Operating Days Type: ${typeof kitchen.operatingDays}`);
      console.log(`Operating Days Value:`, kitchen.operatingDays);
      
      if (kitchen.operatingDays) {
        try {
          const parsed = typeof kitchen.operatingDays === 'string' 
            ? JSON.parse(kitchen.operatingDays) 
            : kitchen.operatingDays;
          console.log(`Parsed Operating Days:`, JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log(`Error parsing:`, e);
        }
      } else {
        console.log(`No operatingDays data (null/undefined)`);
      }
      console.log("---\n");
    }
  } catch (error) {
    console.error("Error checking operating days:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOperatingDays();
