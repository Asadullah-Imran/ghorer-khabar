import { prisma } from '../src/lib/prisma/prisma';
import { calculateDistance, formatDistance } from '../src/lib/utils/distance';

async function verifyDistanceCalculation() {
  console.log('🔍 Verifying Distance Calculation Setup\n');

  try {
    // 1. Check kitchens with addresses
    console.log('1. Checking Kitchen-Address Links:');
    const kitchens = await prisma.kitchen.findMany({
      include: {
        address: true,
      },
    });

    console.log(`   Total kitchens: ${kitchens.length}\n`);

    kitchens.forEach((k, index) => {
      console.log(`   ${index + 1}. ${k.name}`);
      console.log(`      - addressId: ${k.addressId || 'MISSING!'}`);
      console.log(`      - has address object: ${!!k.address}`);
      if (k.address) {
        console.log(`      - address label: ${k.address.label}`);
        console.log(`      - isKitchenAddress: ${k.address.isKitchenAddress}`);
        console.log(`      - coordinates: (${k.address.latitude}, ${k.address.longitude})`);
      }
      console.log('');
    });

    // 2. Check for kitchen addresses
    console.log('2. Kitchen Addresses in Address Table:');
    const kitchenAddresses = await prisma.address.findMany({
      where: {
        isKitchenAddress: true,
      },
      include: {
        kitchen: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`   Total kitchen addresses: ${kitchenAddresses.length}\n`);
    kitchenAddresses.forEach((addr, index) => {
      console.log(`   ${index + 1}. ${addr.label}`);
      console.log(`      - Linked to: ${addr.kitchen?.name || 'No kitchen!'}`);
      console.log(`      - Coordinates: (${addr.latitude}, ${addr.longitude})`);
      console.log('');
    });

    // 3. Test distance calculation with real data
    console.log('3. Testing Distance Calculation:');
    
    // Get a user with a default address
    const userWithAddress = await prisma.address.findFirst({
      where: {
        isDefault: true,
      },
      include: {
        user: true,
      },
    });

    if (userWithAddress && kitchens.length > 0) {
      console.log(`   User: ${userWithAddress.user.name || 'Unknown'}`);
      console.log(`   User address: ${userWithAddress.address}`);
      console.log(`   User coordinates: (${userWithAddress.latitude}, ${userWithAddress.longitude})\n`);

      kitchens.forEach((kitchen) => {
        if (kitchen.address?.latitude && kitchen.address?.longitude && 
            userWithAddress.latitude && userWithAddress.longitude) {
          const distance = calculateDistance(
            userWithAddress.latitude,
            userWithAddress.longitude,
            kitchen.address.latitude,
            kitchen.address.longitude
          );
          console.log(`   Distance to ${kitchen.name}: ${formatDistance(distance)}`);
        } else {
          console.log(`   Distance to ${kitchen.name}: Cannot calculate (missing coordinates)`);
        }
      });
    } else {
      console.log('   ⚠️  No user with default address found for testing');
    }

    console.log('\n✅ Verification completed!');
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDistanceCalculation();
