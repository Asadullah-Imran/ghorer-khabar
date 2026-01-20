import { prisma } from '../src/lib/prisma/prisma';

/**
 * Migration script to convert existing kitchen locations to Address records
 * Run this script once after schema update to migrate existing data
 */
async function migrateKitchenAddresses() {
  
  try {
    console.log('🔄 Starting kitchen address migration...\n');

    // Find all kitchens that don't have an addressId yet but have location data
    const kitchens = await prisma.kitchen.findMany({
      where: {
        addressId: null,
        OR: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          { location: { not: null } },
        ],
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`Found ${kitchens.length} kitchens to migrate\n`);

    if (kitchens.length === 0) {
      console.log('✅ No kitchens to migrate. All done!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const kitchen of kitchens) {
      try {
        // Create Address record for kitchen
        const kitchenAddress = await prisma.address.create({
          data: {
            userId: kitchen.sellerId,
            label: `Kitchen: ${kitchen.name}`,
            address: kitchen.location || 'Address not provided',
            zone: kitchen.area || undefined,
            latitude: kitchen.latitude || undefined,
            longitude: kitchen.longitude || undefined,
            isDefault: false,
            isKitchenAddress: true,
          },
        });

        // Link kitchen to the new address
        await prisma.kitchen.update({
          where: { id: kitchen.id },
          data: { addressId: kitchenAddress.id },
        });

        successCount++;
        console.log(
          `✅ [${successCount}/${kitchens.length}] Migrated kitchen: ${kitchen.name} (ID: ${kitchen.id})`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Failed to migrate kitchen: ${kitchen.name} (ID: ${kitchen.id})`,
          error
        );
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Migration completed!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

    // Verify the migration
    const unmigrated = await prisma.kitchen.count({
      where: { addressId: null },
    });

    if (unmigrated > 0) {
      console.log(`⚠️  Warning: ${unmigrated} kitchens still without addresses`);
    } else {
      console.log('✅ All kitchens have been migrated successfully!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateKitchenAddresses()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
