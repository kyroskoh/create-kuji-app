const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDemoUser() {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' },
      include: {
        userSettings: true
      }
    });

    if (!demoUser) {
      console.log('❌ Demo user not found');
      return;
    }

    console.log('✅ Demo user found:');
    console.log('   Username:', demoUser.username);
    console.log('   Display Name:', demoUser.displayName);
    console.log('   Subscription Plan:', demoUser.userSettings?.subscriptionPlan || 'No settings');
    console.log('   Stock Page Published:', demoUser.userSettings?.stockPagePublished ?? 'N/A');
    
    if (demoUser.userSettings?.subscriptionPlan === 'pro') {
      console.log('\n🎉 SUCCESS: Demo user is on Pro plan!');
    } else {
      console.log('\n⚠️  Warning: Demo user is NOT on Pro plan');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDemoUser();