import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const defaultRooms = [
    { name: 'Global', description: 'General discussion for everyone', isDefault: true },
    { name: 'Gaming', description: 'Gaming discussions and LFG', isDefault: true },
    { name: 'Coding', description: 'Programming help and discussions', isDefault: true },
    { name: 'Students', description: 'Student community hub', isDefault: true },
    { name: 'Random', description: 'Off-topic and fun', isDefault: true },
  ];

  for (const room of defaultRooms) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {},
      create: room,
    });
    console.log(`  Room: ${room.name}`);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
