const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany();
  const conversations = await prisma.conversation.findMany();
  const users = await prisma.user.findMany({ take: 5 });
  
  console.log('--- DATABASE STATUS ---');
  console.log(`Rooms count: ${rooms.length}`);
  console.log(`Conversations count: ${conversations.length}`);
  console.log(`Users count: ${users.length}`);
  
  if (rooms.length > 0) {
    console.log('Sample Rooms:', rooms.map(r => r.name).join(', '));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
