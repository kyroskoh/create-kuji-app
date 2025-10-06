import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing demo user username status...');

  // Find the demo user
  const demoUser = await prisma.user.findUnique({
    where: { username: 'demo' }
  });

  if (!demoUser) {
    console.log('❌ Demo user not found!');
    return;
  }

  console.log(`📋 Current demo user status:`);
  console.log(`   Username: ${demoUser.username}`);
  console.log(`   UsernameSetByUser: ${demoUser.usernameSetByUser}`);

  // Update demo user to have username permanently set
  const updatedUser = await prisma.user.update({
    where: { username: 'demo' },
    data: {
      usernameSetByUser: true,
      displayName: 'Demo User'
    }
  });

  console.log(`✅ Updated demo user:`);
  console.log(`   Username: ${updatedUser.username}`);
  console.log(`   UsernameSetByUser: ${updatedUser.usernameSetByUser}`);
  console.log(`   DisplayName: ${updatedUser.displayName}`);
  console.log('🎉 Demo user is now permanently set!');
}

main()
  .catch((e) => {
    console.error('❌ Error fixing demo user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
