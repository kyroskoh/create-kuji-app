import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Support Script: Change Username
 * 
 * Usage:
 * 1. With arguments: npm run support:change-username <current-username> <new-username>
 * 2. Interactive: npm run support:change-username
 * 
 * This script bypasses the one-time username change restriction
 * and allows support team to change usernames for users.
 */

async function main() {
  console.log('🔧 Support Script: Change Username\n');

  // Get arguments from command line
  const args = process.argv.slice(2);
  let currentUsername = args[0];
  let newUsername = args[1];

  // Validate inputs
  if (!currentUsername || !newUsername) {
    console.log('Usage: npm run support:change-username <current-username> <new-username>');
    console.log('Example: npm run support:change-username johndoe john_doe_new\n');
    process.exit(1);
  }

  currentUsername = currentUsername.toLowerCase().trim();
  newUsername = newUsername.toLowerCase().trim();

  console.log(`📋 Request Details:`);
  console.log(`   Current Username: ${currentUsername}`);
  console.log(`   New Username: ${newUsername}\n`);

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

  // Find the user with current username
  const user = await prisma.user.findUnique({
    where: { username: currentUsername },
    include: {
      emails: {
        select: {
          address: true,
          isPrimary: true
        }
      }
    }
  });

  if (!user) {
    console.log(`❌ Error: User with username "${currentUsername}" not found`);
    process.exit(1);
  }

  console.log(`✅ Found user:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Display Name: ${user.displayName}`);
  console.log(`   Email: ${user.emails[0]?.address || 'N/A'}`);
  console.log(`   Username Set By User: ${user.usernameSetByUser}`);
  console.log(`   Super Admin: ${user.isSuperAdmin}\n`);

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
    console.log(`   Email: ${updatedUser.emails[0]?.address || 'N/A'}`);
    console.log(`   Username Set By User: ${updatedUser.usernameSetByUser}`);
    console.log(`\n🎉 Username change completed successfully!`);

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
