import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Support Script: Change Username by Email Address
 * 
 * Usage:
 * npm run support:change-username-email <email> <new-username>
 * 
 * This script is useful when:
 * - User has a temporary auto-generated username
 * - User doesn't remember their current username
 * - Support needs to identify user by email instead
 * 
 * Bypasses the one-time username change restriction.
 */

async function main() {
  console.log('🔧 Support Script: Change Username by Email\n');

  // Get arguments from command line
  const args = process.argv.slice(2);
  let email = args[0];
  let newUsername = args[1];

  // Validate inputs
  if (!email || !newUsername) {
    console.log('Usage: npm run support:change-username-email <email> <new-username>');
    console.log('Example: npm run support:change-username-email user@example.com johndoe\n');
    process.exit(1);
  }

  email = email.toLowerCase().trim();
  newUsername = newUsername.toLowerCase().trim();

  console.log(`📋 Request Details:`);
  console.log(`   Email: ${email}`);
  console.log(`   New Username: ${newUsername}\n`);

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Error: Invalid email format');
    process.exit(1);
  }

  // Validate new username format
  const usernameRegex = /^[a-zA-Z0-9_-]{5,20}$/;
  if (!usernameRegex.test(newUsername)) {
    console.log('❌ Error: New username must be 5-20 characters and contain only letters, numbers, underscores, and hyphens');
    process.exit(1);
  }

  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'system', 'root', 'superuser', 'sudo',
    'demo', 'test', 'guest', 'anonymous', 'user',
    'moderator', 'mod', 'support', 'help', 'staff', 'owner',
    'api', 'www', 'mail', 'ftp', 'smtp', 'http', 'https',
    'createkuji', 'createmykuji', 'makekuji', 'makemykuji', 'kuji', 'kyros', 'kyroskoh',
    'null', 'undefined', 'none', 'nil', 'void',
    'bot', 'official', 'verified', 'account'
  ];

  if (reservedUsernames.includes(newUsername)) {
    console.log(`❌ Error: "${newUsername}" is a reserved username and cannot be used`);
    console.log('Reserved usernames:', reservedUsernames.join(', '));
    process.exit(1);
  }

  // Find the user by email
  const userEmail = await prisma.email.findUnique({
    where: { address: email },
    include: {
      user: {
        include: {
          emails: {
            select: {
              address: true,
              isPrimary: true
            }
          }
        }
      }
    }
  });

  if (!userEmail || !userEmail.user) {
    console.log(`❌ Error: No user found with email "${email}"`);
    process.exit(1);
  }

  const user = userEmail.user;
  const currentUsername = user.username;

  console.log(`✅ Found user:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Current Username: ${user.username}`);
  console.log(`   Display Name: ${user.displayName}`);
  console.log(`   Email: ${email}`);
  console.log(`   Username Set By User: ${user.usernameSetByUser}`);
  console.log(`   Super Admin: ${user.isSuperAdmin}`);
  
  // Check if current username looks auto-generated (temporary)
  const isTempUsername = user.username.length === 10 || user.username.length === 11 || user.username.includes('_');
  if (isTempUsername && !user.usernameSetByUser) {
    console.log(`   ℹ️  Note: Current username appears to be temporary/auto-generated`);
  }
  console.log('');

  // Check if new username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: newUsername }
  });

  if (existingUser && existingUser.id !== user.id) {
    console.log(`❌ Error: Username "${newUsername}" is already taken by another user`);
    console.log(`   User ID: ${existingUser.id}`);
    process.exit(1);
  }

  // Update the username
  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: newUsername,
        displayName: newUsername,
        usernameSetByUser: true
      },
      include: {
        emails: {
          select: {
            address: true,
            isPrimary: true
          }
        }
      }
    });

    console.log(`✅ Successfully updated username!\n`);
    console.log(`📋 Updated User Details:`);
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Old Username: ${currentUsername}`);
    console.log(`   New Username: ${updatedUser.username} ✨`);
    console.log(`   Display Name: ${updatedUser.displayName}`);
    console.log(`   Email: ${email}`);
    console.log(`   Username Set By User: ${updatedUser.usernameSetByUser}`);
    console.log(`\n🎉 Username change completed successfully!`);
    console.log(`\nℹ️  User can now login with email "${email}" and username "${newUsername}"`);

  } catch (error) {
    console.error('❌ Error updating username:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
