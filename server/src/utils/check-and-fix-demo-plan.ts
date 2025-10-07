import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFixDemoPlan() {
  try {
    console.log('\n🔍 Checking demo user subscription plan...\n');
    
    // Find demo user
    const user = await prisma.user.findUnique({
      where: { username: 'demo' },
      include: {
        userSettings: true
      }
    });
    
    if (!user) {
      console.log('❌ Demo user not found in database');
      return;
    }
    
    console.log('📊 Current Status:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Settings exist: ${user.userSettings ? 'Yes' : 'No'}`);
    console.log(`   Current Plan: ${user.userSettings?.subscriptionPlan || 'No settings found'}`);
    
    if (!user.userSettings) {
      console.log('\n⚠️  User has no settings record! Creating one...');
      
      const newSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          subscriptionPlan: 'pro',
          currency: '¥',
          weightMode: 'basic'
        }
      });
      
      console.log('✅ Created new settings with Pro plan');
      console.log(`   Settings ID: ${newSettings.id}`);
      console.log(`   Plan: ${newSettings.subscriptionPlan}`);
    } else if (user.userSettings.subscriptionPlan !== 'pro') {
      console.log('\n🔄 Updating subscription plan to Pro...');
      
      const updated = await prisma.userSettings.update({
        where: { userId: user.id },
        data: { subscriptionPlan: 'pro' }
      });
      
      console.log('✅ Updated subscription plan successfully');
      console.log(`   Old Plan: ${user.userSettings.subscriptionPlan}`);
      console.log(`   New Plan: ${updated.subscriptionPlan}`);
    } else {
      console.log('\n✅ Demo user already has Pro plan!');
    }
    
    // Verify the update
    const verifyUser = await prisma.user.findUnique({
      where: { username: 'demo' },
      include: { userSettings: true }
    });
    
    console.log('\n🎉 Final Status:');
    console.log(`   Username: ${verifyUser?.username}`);
    console.log(`   Subscription Plan: ${verifyUser?.userSettings?.subscriptionPlan}`);
    console.log('\n✅ Database is now synced with Pro plan!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your backend server (npm run dev)');
    console.log('   2. Clear browser cache or logout/login');
    console.log('   3. The Analytics and Branding tabs should now appear!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixDemoPlan();
