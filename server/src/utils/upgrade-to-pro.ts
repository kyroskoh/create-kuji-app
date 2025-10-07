import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function upgradeUserToPro() {
  try {
    console.log('\n🔧 Upgrade User to Pro Plan for Testing\n');
    
    const username = await question('Enter username to upgrade: ');
    
    if (!username.trim()) {
      console.log('❌ Username cannot be empty');
      rl.close();
      return;
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });
    
    if (!user) {
      console.log(`❌ User "${username}" not found`);
      rl.close();
      return;
    }
    
    // Get current settings
    const currentSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id }
    });
    
    console.log(`\n📊 Current user info:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Current Plan: ${currentSettings?.subscriptionPlan || 'free'}`);
    
    const confirm = await question('\n⚠️  Upgrade this user to PRO plan? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Upgrade cancelled');
      rl.close();
      return;
    }
    
    // Update user's settings to Pro plan
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: { subscriptionPlan: 'pro' },
      create: {
        userId: user.id,
        subscriptionPlan: 'pro',
        currency: '¥',
        weightMode: 'basic'
      }
    });
    
    console.log(`\n✅ User "${username}" upgraded to PRO plan!`);
    console.log(`\n📋 New features unlocked:`);
    console.log(`   ✅ Analytics Dashboard`);
    console.log(`   ✅ Custom Branding`);
    console.log(`   ✅ Unlimited Tiers & Colors`);
    console.log(`   ✅ Advanced Weights`);
    console.log(`   ✅ Custom Animations`);
    console.log(`   ✅ Priority Support`);
    console.log(`   ✅ API Access`);
    
    console.log(`\n🎉 You can now see Analytics and Branding tabs in the Manage page!`);
    
  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

upgradeUserToPro();
