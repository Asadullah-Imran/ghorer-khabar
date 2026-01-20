import { prisma } from '../src/lib/prisma/prisma';

/**
 * Fix existing users who only have kitchen addresses with no default
 * Sets their kitchen address as default if they have no other default address
 */
async function fixDefaultAddresses() {
  console.log('🔧 Fixing default addresses for users with only kitchen addresses\n');

  try {
    // Find all users
    const users = await prisma.user.findMany({
      include: {
        addresses: true,
      },
    });

    let fixedCount = 0;

    for (const user of users) {
      // Check if user has a default address
      const hasDefault = user.addresses.some(addr => addr.isDefault);

      if (!hasDefault && user.addresses.length > 0) {
        // User has addresses but no default - set the first one as default
        const firstAddress = user.addresses[0];
        
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });

        console.log(`✅ Set default address for ${user.name || user.email}`);
        console.log(`   Address: ${firstAddress.label}`);
        console.log(`   isKitchenAddress: ${firstAddress.isKitchenAddress}`);
        console.log('');
        fixedCount++;
      }
    }

    console.log('='.repeat(50));
    console.log(`Fixed ${fixedCount} users`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDefaultAddresses();
