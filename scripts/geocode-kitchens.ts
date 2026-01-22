import { prisma } from '../src/lib/prisma/prisma';
import { geocodeAddress } from '../src/lib/utils/geocoding';

/**
 * Geocode kitchen addresses that are missing coordinates
 */
async function geocodeKitchenAddresses() {
  console.log('🌍 Geocoding kitchen addresses...\n');

  try {
    // Find kitchen addresses without coordinates
    const addresses = await prisma.address.findMany({
      where: {
        isKitchenAddress: true,
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      include: {
        kitchen: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${addresses.length} kitchen addresses  to geocode\n`);

    let successCount = 0;
    let failCount = 0;

    for (const addr of addresses) {
      const kitchenName = addr.kitchen?.name || 'Unknown';
      console.log(`Geocoding: ${kitchenName}`);
      console.log(`  Address: ${addr.address}`);

      // Geocode the address
      const coords = await geocodeAddress(addr.address);

      if (coords) {
        // Update address with coordinates
        await prisma.address.update({
          where: { id: addr.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        });

        console.log(`  ✅ Success: (${coords.latitude}, ${coords.longitude})`);
        successCount++;
      } else {
        console.log(`  ❌ Failed to geocode`);
        failCount++;
      }

      // Wait 1 second between requests (Nominatim rate limit)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('');
    }

    console.log('='.repeat(50));
    console.log(`Geocoding completed!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ Error during geocoding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

geocodeKitchenAddresses();
