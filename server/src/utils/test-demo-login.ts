import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken, createSession } from './jwt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing demo user login flow...\n');

  // Step 1: Find demo user
  const demoUser = await prisma.user.findFirst({
    where: {
      AND: [
        { isActive: true },
        { username: 'demo' }
      ]
    },
    include: {
      password: true,
      emails: {
        where: { isPrimary: true }
      }
    }
  });

  if (!demoUser || !demoUser.password) {
    console.log('❌ Demo user not found or has no password');
    return;
  }

  console.log('✅ Found demo user:', {
    id: demoUser.id,
    username: demoUser.username,
    displayName: demoUser.displayName,
    isSuperAdmin: demoUser.isSuperAdmin,
    email: demoUser.emails[0]?.address,
    isActive: demoUser.isActive
  });

  // Step 2: Test password verification
  const testPassword = 'Demo123!';
  const isValidPassword = await bcrypt.compare(testPassword, demoUser.password.hash);
  
  console.log(`\n🔑 Password verification:`);
  console.log(`   Input: "${testPassword}"`);
  console.log(`   Valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`);

  if (!isValidPassword) {
    console.log('❌ Password verification failed - cannot continue test');
    return;
  }

  // Step 3: Generate access token (same as login controller)
  console.log(`\n🎫 Generating access token...`);
  const accessTokenPayload = {
    userId: demoUser.id,
    username: demoUser.username,
    isSuperAdmin: demoUser.isSuperAdmin
  };

  console.log('   Access token payload:', accessTokenPayload);

  const accessToken = generateAccessToken(accessTokenPayload);
  console.log(`   Generated token: ${accessToken.substring(0, 50)}...`);

  // Step 4: Decode the token to verify contents
  console.log(`\n🔍 Decoding access token...`);
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!, {
      issuer: 'create-kuji-server',
      audience: 'create-kuji-app'
    }) as any;

    console.log('   Decoded payload:', {
      userId: decoded.userId,
      username: decoded.username,
      isSuperAdmin: decoded.isSuperAdmin,
      exp: new Date(decoded.exp * 1000).toISOString(),
      iss: decoded.iss,
      aud: decoded.aud
    });

    // Step 5: Check what the frontend would see
    console.log(`\n👤 What frontend would receive:`);
    const mockLoginResponse = {
      message: 'Login successful',
      user: {
        id: demoUser.id,
        username: demoUser.username,
        displayName: demoUser.displayName,
        email: demoUser.emails[0]?.address,
        emailVerified: demoUser.emails[0]?.verifiedAt !== null,
        isSuperAdmin: demoUser.isSuperAdmin
      },
      tokens: {
        accessToken: 'JWT_TOKEN_HERE'
      }
    };

    console.log('   Login response user object:', mockLoginResponse.user);

    // Final verification
    console.log(`\n🎯 Final verification:`);
    console.log(`   Database user.isSuperAdmin: ${demoUser.isSuperAdmin}`);
    console.log(`   JWT payload isSuperAdmin: ${decoded.isSuperAdmin}`);
    console.log(`   Response user.isSuperAdmin: ${mockLoginResponse.user.isSuperAdmin}`);
    
    if (demoUser.isSuperAdmin === false && decoded.isSuperAdmin === false && mockLoginResponse.user.isSuperAdmin === false) {
      console.log(`   ✅ All values are correctly FALSE - demo user is NOT a super admin`);
    } else {
      console.log(`   ⚠️  Inconsistency detected!`);
    }

  } catch (error) {
    console.log('   ❌ Failed to decode token:', error);
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