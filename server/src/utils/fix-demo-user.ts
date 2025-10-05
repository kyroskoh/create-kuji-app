import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking demo user status...');

  // Find the demo user
  const demoUser = await prisma.user.findFirst({
    where: {
      username: 'demo'
    },
    include: {
      emails: true
    }
  });

  if (!demoUser) {
    console.log('❌ Demo user not found');
    return;
  }

  console.log('📋 Current demo user status:');
  console.log(`- Username: ${demoUser.username}`);
  console.log(`- Display Name: ${demoUser.displayName}`);
  console.log(`- Is Super Admin: ${demoUser.isSuperAdmin}`);
  console.log(`- Email: ${demoUser.emails[0]?.address}`);
  console.log(`- Created: ${demoUser.createdAt}`);

  if (demoUser.isSuperAdmin) {
    console.log('\n🔧 Fixing demo user - removing super admin privileges...');
    
    const updatedUser = await prisma.user.update({
      where: { id: demoUser.id },
      data: { 
        isSuperAdmin: false,
        displayName: 'Demo User'
      },
      include: {
        emails: true
      }
    });

    console.log('✅ Demo user fixed:');
    console.log(`- Username: ${updatedUser.username}`);
    console.log(`- Display Name: ${updatedUser.displayName}`);
    console.log(`- Is Super Admin: ${updatedUser.isSuperAdmin}`);
  } else {
    console.log('✅ Demo user is already configured correctly');
  }

  // Also check super admin user
  console.log('\n🔍 Checking super admin user...');
  const superAdmin = await prisma.user.findFirst({
    where: {
      username: 'kyroskoh'
    }
  });

  if (superAdmin) {
    console.log(`✅ Super admin user found: ${superAdmin.username} (isSuperAdmin: ${superAdmin.isSuperAdmin})`);
  } else {
    console.log('❌ Super admin user not found');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });