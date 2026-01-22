import { prisma } from '../src/lib/prisma/prisma';

async function checkOldFields() {
  const kitchens = await prisma.kitchen.findMany({
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      location: true,
      area: true,
    },
  });

  console.log('Old kitchen fields:');
  kitchens.forEach((k) => {
    console.log(`${k.name}:`);
    console.log(`  lat=${k.latitude}, lng=${k.longitude}`);
    console.log(`  location=${k.location}, area=${k.area}`);
  });

  await prisma.$disconnect();
}

checkOldFields();
