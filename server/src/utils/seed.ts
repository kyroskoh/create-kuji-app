import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin user
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'me@kyroskoh.com';
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || 'kyroskoh';
  
  // Check if super admin already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: superAdminUsername },
        { emails: { some: { address: superAdminEmail } } }
      ]
    }
  });

  if (existingUser) {
    console.log(`✅ Super admin user already exists: ${existingUser.username}`);
  } else {
    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        username: superAdminUsername,
        displayName: 'Kyros Koh',
        isSuperAdmin: true,
        emails: {
          create: {
            address: superAdminEmail,
            isPrimary: true,
            verifiedAt: new Date(),
          }
        },
        password: {
          create: {
            hash: await bcrypt.hash('Admin123!', 12)
          }
        }
      },
      include: {
        emails: true
      }
    });

    console.log(`✅ Created super admin user: ${superAdmin.username} (${superAdmin.emails[0]?.address})`);
  }

  // Create demo user for testing
  const demoEmail = 'demo@createkuji.com';
  const demoUsername = 'demo';
  
  // Check if demo user already exists
  const existingDemo = await prisma.user.findFirst({
    where: {
      OR: [
        { username: demoUsername },
        { emails: { some: { address: demoEmail } } }
      ]
    }
  });

  if (existingDemo) {
    console.log(`✅ Demo user already exists: ${existingDemo.username}`);
  } else {
    // Create demo user
    const demoUser = await prisma.user.create({
      data: {
        username: demoUsername,
        displayName: 'Demo User',
        isSuperAdmin: false,
        emails: {
          create: {
            address: demoEmail,
            isPrimary: true,
            verifiedAt: new Date(),
          }
        },
        password: {
          create: {
            hash: await bcrypt.hash('Demo123!', 12)
          }
        }
      },
      include: {
        emails: true
      }
    });

    console.log(`✅ Created demo user: ${demoUser.username} (${demoUser.emails[0]?.address})`);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });