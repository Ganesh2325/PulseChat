const { PrismaClient } = require('@prisma/client');

async function test() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('SUCCESS: Prisma connected!');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query result:', result);
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

test();
