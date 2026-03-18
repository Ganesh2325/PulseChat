const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const roomCount = await prisma.room.count();
    const rooms = await prisma.room.findMany({ select: { name: true, isDefault: true } });
    const convCount = await prisma.conversation.count();
    const userCount = await prisma.user.count();
    
    console.log('--- DATABASE STATUS ---');
    console.log(`Users: ${userCount}`);
    console.log(`Rooms: ${roomCount}`);
    console.log('Room Names:', rooms.map(r => r.name).join(', '));
    console.log(`Conversations: ${convCount}`);
    console.log('-----------------------');
  } catch (err) {
    console.error('Diagnostic failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
