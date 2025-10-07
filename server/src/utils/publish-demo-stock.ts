import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function publishDemoStock() {
  try {
    console.log('\n📢 Publishing demo user stock page...\n');
    
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
    console.log(`   Plan: ${user.userSettings?.subscriptionPlan || 'free'}`);
    
    // Check current session status
    if (!user.userSettings) {
      console.log('\n⚠️  No settings found. Creating settings with published stock...');
      
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          subscriptionPlan: 'pro',
          currency: '¥',
          weightMode: 'basic',
          sessionStatus: 'PUBLISHED' // Publish the stock page
        }
      });
      
      console.log('✅ Created settings and published stock page');
    } else {
      const currentStatus = user.userSettings.sessionStatus;
      console.log(`   Current Session Status: ${currentStatus}`);
      
      if (currentStatus === 'PUBLISHED') {
        console.log('\n✅ Stock page is already published!');
      } else {
        console.log(`\n🔄 Updating session status from ${currentStatus} to PUBLISHED...`);
        
        await prisma.userSettings.update({
          where: { userId: user.id },
          data: { sessionStatus: 'PUBLISHED' }
        });
        
        console.log('✅ Stock page is now published!');
      }
    }
    
    // Verify
    const verifyUser = await prisma.user.findUnique({
      where: { username: 'demo' },
      include: { userSettings: true }
    });
    
    console.log('\n🎉 Final Status:');
    console.log(`   Username: ${verifyUser?.username}`);
    console.log(`   Plan: ${verifyUser?.userSettings?.subscriptionPlan}`);
    console.log(`   Stock Page: ${verifyUser?.userSettings?.sessionStatus}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Remove /demo and /demo/stock routes from App.jsx');
    console.log('   2. Update Home page link to point to /demo/stock');
    console.log('   3. Demo stock page is now at: http://localhost:5173/demo/stock');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

publishDemoStock();
