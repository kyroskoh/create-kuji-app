import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Listing all users in the database...\n');

  const users = await prisma.user.findMany({
    include: {
      emails: true,
      _count: {
        select: {
          sessions: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found in the database');
    return;
  }

  console.log(`📊 Found ${users.length} user(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Display Name: ${user.displayName}`);
    console.log(`   Is Super Admin: ${user.isSuperAdmin ? '✅ YES' : '❌ NO'}`);
    console.log(`   Is Active: ${user.isActive ? '✅ YES' : '❌ NO'}`);
    console.log(`   Primary Email: ${user.emails.find(e => e.isPrimary)?.address || 'None'}`);
    console.log(`   Email Verified: ${user.emails.find(e => e.isPrimary)?.verifiedAt ? '✅ YES' : '❌ NO'}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
    console.log(`   Last Login: ${user.lastLogin ? user.lastLogin.toISOString() : 'Never'}`);
    console.log(`   Active Sessions: ${user._count.sessions}`);
    console.log(`   ---`);
  });

  // Check for potential issues
  const superAdmins = users.filter(u => u.isSuperAdmin);
  const demoUsers = users.filter(u => u.username === 'demo');
  
  console.log(`\n📋 Summary:`);
  console.log(`   Total users: ${users.length}`);
  console.log(`   Super admins: ${superAdmins.length} (${superAdmins.map(u => u.username).join(', ')})`);
  console.log(`   Demo users: ${demoUsers.length}`);
  
  if (demoUsers.length > 0) {
    console.log(`\n🎯 Demo user analysis:`);
    demoUsers.forEach(user => {
      console.log(`   Username: ${user.username}`);
      console.log(`   Is Super Admin: ${user.isSuperAdmin ? '⚠️  YES (PROBLEM!)' : '✅ NO (correct)'}`);
      if (user.isSuperAdmin) {
        console.log(`   🚨 ERROR: Demo user should NOT be a super admin!`);
      }
    });
  }

  if (superAdmins.length === 0) {
    console.log(`\n⚠️  WARNING: No super admin users found! This might be a problem.`);
  } else if (superAdmins.length > 1) {
    console.log(`\n⚠️  INFO: Multiple super admins found: ${superAdmins.map(u => u.username).join(', ')}`);
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