import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing demo user sessions...\n');

  // Find demo user
  const demoUser = await prisma.user.findFirst({
    where: { username: 'demo' },
    include: {
      sessions: true
    }
  });

  if (!demoUser) {
    console.log('❌ Demo user not found');
    return;
  }

  console.log(`📊 Found ${demoUser.sessions.length} active sessions for demo user`);

  if (demoUser.sessions.length === 0) {
    console.log('✅ No sessions to clear');
    return;
  }

  // Delete all sessions for demo user
  const result = await prisma.session.deleteMany({
    where: { userId: demoUser.id }
  });

  console.log(`✅ Cleared ${result.count} sessions for demo user`);
  console.log('\n💡 Now clear your browser localStorage and try logging in again:');
  console.log('   1. Open browser dev tools (F12)');
  console.log('   2. Go to Application/Storage tab');
  console.log('   3. Clear Local Storage for localhost:5173');
  console.log('   4. Refresh the page and try demo login again');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });