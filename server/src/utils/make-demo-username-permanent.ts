import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Making demo username permanent...');
  
  try {
    // Find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' },
      include: {
        emails: {
          where: { isPrimary: true }
        },
        userSettings: true,
        _count: {
          select: {
            prizes: true,
            drawSessions: true,
            pricingPresets: true
          }
        }
      }
    });

    if (!demoUser) {
      console.log('❌ Demo user not found!');
      console.log('💡 You may need to run the seed script first to create the demo user.');
      return;
    }

    console.log(`📋 Current demo user status:`);
    console.log(`   ID: ${demoUser.id}`);
    console.log(`   Username: ${demoUser.username}`);
    console.log(`   Display Name: ${demoUser.displayName || 'Not set'}`);
    console.log(`   Username Set By User: ${demoUser.usernameSetByUser ? '✅ YES (Permanent)' : '❌ NO (Temporary)'}`);
    console.log(`   Super Admin: ${demoUser.isSuperAdmin ? 'Yes' : 'No'}`);
    console.log(`   Active: ${demoUser.isActive ? 'Yes' : 'No'}`);
    console.log(`   Primary Email: ${demoUser.emails[0]?.address || 'Not set'}`);
    console.log(`   Created: ${demoUser.createdAt.toISOString()}`);
    console.log(`   Last Login: ${demoUser.lastLogin?.toISOString() || 'Never'}`);
    console.log(`   Data Counts:`);
    console.log(`     - Prizes: ${demoUser._count.prizes}`);
    console.log(`     - Draw Sessions: ${demoUser._count.drawSessions}`);
    console.log(`     - Pricing Presets: ${demoUser._count.pricingPresets}`);
    console.log(`   Subscription Plan: ${demoUser.userSettings?.subscriptionPlan || 'Not set'}`);
    console.log(`   Stock Page Published: ${demoUser.userSettings?.stockPagePublished ? 'Yes' : 'No'}`);

    // Check if already permanent
    if (demoUser.usernameSetByUser) {
      console.log('✨ Demo user username is already permanent!');
      console.log('   No changes needed.');
      return;
    }

    // Update demo user to have permanent username
    console.log('🔄 Updating demo user to permanent username...');
    const updatedUser = await prisma.user.update({
      where: { username: 'demo' },
      data: {
        usernameSetByUser: true,
        displayName: demoUser.displayName || 'Demo User', // Set display name if not already set
      }
    });

    console.log('✅ Successfully updated demo user:');
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Username Set By User: ${updatedUser.usernameSetByUser ? '✅ YES (Permanent)' : '❌ NO (Temporary)'}`);
    console.log(`   Display Name: ${updatedUser.displayName}`);
    
    console.log('🎉 Demo user now has a permanent username!');
    console.log('💡 Benefits:');
    console.log('   - Username "demo" can no longer be changed');
    console.log('   - Demo user is protected from username conflicts');
    console.log('   - Consistent demo experience for all users');

    // Also ensure demo user has proper settings
    if (!demoUser.userSettings) {
      console.log('📝 Creating default settings for demo user...');
      await prisma.userSettings.create({
        data: {
          userId: demoUser.id,
          subscriptionPlan: 'pro', // Give demo user pro features
          stockPagePublished: true, // Make sure demo stock is visible
          country: 'Malaysia',
          countryCode: 'MY',
          countryEmoji: '🇲🇾',
          currency: 'MYR',
          locale: 'ms-MY'
        }
      });
      console.log('✅ Created default settings with Pro plan');
    }

  } catch (error) {
    console.error('❌ Error updating demo user:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });