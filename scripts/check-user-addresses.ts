import { prisma } from '../src/lib/prisma/prisma';

async function checkUserAddresses() {
  console.log('🔍 Checking User Addresses\n');

  try {
    // Find all users with addresses
    const users = await prisma.user.findMany({
      include: {
        addresses: true,
      },
      where: {
        addresses: {
          some: {},
        },
      },
    });

    console.log(`Found ${users.length} users with addresses\n`);

    for (const user of users) {
      console.log(`User: ${user.name || user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Addresses: ${user.addresses.length}`);
      
      user.addresses.forEach((addr, index) => {
        console.log(`\n  Address ${index + 1}:`);
        console.log(`    Label: ${addr.label}`);
        console.log(`    Address: ${addr.address}`);
        console.log(`    isDefault: ${addr.isDefault}`);
        console.log(`    isKitchenAddress: ${addr.isKitchenAddress}`);
        console.log(`    Coordinates: (${addr.latitude}, ${addr.longitude})`);
      });
      console.log('\n' + '='.repeat(60) + '\n');
    }

    // Check specifically for default addresses
    const defaultAddresses = await prisma.address.findMany({
      where: {
        isDefault: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`\n🎯 Default Addresses: ${defaultAddresses.length}\n`);
    defaultAddresses.forEach((addr) => {
      console.log(`User: ${addr.user.name || addr.user.email}`);
      console.log(`  Address: ${addr.address}`);
      console.log(`  Coordinates: (${addr.latitude}, ${addr.longitude})`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAddresses();
