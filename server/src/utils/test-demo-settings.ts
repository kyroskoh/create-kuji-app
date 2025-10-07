import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDemoSettings() {
  try {
    console.log('\n🧪 Testing Demo User Settings API Response\n');
    
    // Find demo user with settings
    const user = await prisma.user.findUnique({
      where: { username: 'demo' },
      include: {
        userSettings: true
      }
    });
    
    if (!user) {
      console.log('❌ Demo user not found');
      return;
    }
    
    console.log('📊 Database Values:');
    console.log('   User ID:', user.id);
    console.log('   Username:', user.username);
    
    if (user.userSettings) {
      console.log('   Session Status:', user.userSettings.sessionStatus);
      console.log('   Subscription Plan:', user.userSettings.subscriptionPlan);
      console.log('   Tier Colors:', user.userSettings.tierColors);
    } else {
      console.log('   ❌ No settings found!');
    }
    
    // Simulate what the API would return
    const { tierColors, sessionStatus, ...rest } = user.userSettings || {};
    const apiResponse = {
      ...rest,
      sessionStatus,
      tierColors: tierColors ? JSON.parse(tierColors) : {},
      // Add computed property for frontend compatibility
      stockPagePublished: sessionStatus === 'PUBLISHED'
    };
    
    console.log('\n📤 API Response (Simulated):');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n✅ Key Checks:');
    console.log('   sessionStatus === "PUBLISHED"?', sessionStatus === 'PUBLISHED');
    console.log('   stockPagePublished:', apiResponse.stockPagePublished);
    console.log('   subscriptionPlan:', apiResponse.subscriptionPlan);
    
    if (apiResponse.stockPagePublished) {
      console.log('\n🎉 Demo stock page should be publicly accessible!');
    } else {
      console.log('\n⚠️  Issue: stockPagePublished is false');
      console.log('   Session Status:', sessionStatus);
      console.log('   Expected: "PUBLISHED"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDemoSettings();
