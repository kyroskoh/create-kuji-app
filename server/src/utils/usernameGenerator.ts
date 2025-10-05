import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Generate a temporary username from an email address
 * Generates exactly 10 characters from email prefix
 * @param email The email address to derive username from
 * @returns A unique temporary username (10 characters)
 */
export async function generateTemporaryUsername(email: string): Promise<string> {
  // Extract the part before @ and clean it
  const emailPrefix = email.split('@')[0];
  
  // Remove special characters and convert to lowercase
  let cleaned = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric
  
  // Pad or truncate to exactly 10 characters
  let baseUsername: string;
  if (cleaned.length >= 10) {
    // If 10 or more characters, take first 10
    baseUsername = cleaned.substring(0, 10);
  } else if (cleaned.length >= 5) {
    // If 5-9 characters, pad with random chars to reach 10
    const needed = 10 - cleaned.length;
    const randomPart = crypto.randomBytes(Math.ceil(needed / 2))
      .toString('hex')
      .substring(0, needed);
    baseUsername = cleaned + randomPart;
  } else {
    // If less than 5 characters, use 'user' prefix + cleaned + random to reach 10
    const prefix = 'user';
    const combined = prefix + cleaned;
    if (combined.length >= 10) {
      baseUsername = combined.substring(0, 10);
    } else {
      const needed = 10 - combined.length;
      const randomPart = crypto.randomBytes(Math.ceil(needed / 2))
        .toString('hex')
        .substring(0, needed);
      baseUsername = combined + randomPart;
    }
  }
  
  // Check if this username is available
  const existing = await prisma.user.findUnique({
    where: { username: baseUsername }
  });
  
  if (!existing) {
    return baseUsername;
  }
  
  // Username exists, try adding 4-character random suffix
  // Format: first 6 chars of base + underscore + 4 random chars = 11 total
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = crypto.randomBytes(2).toString('hex'); // 4 hex chars
    const truncatedBase = baseUsername.substring(0, 6); // Take first 6 chars
    const candidateUsername = `${truncatedBase}_${randomSuffix}`; // 6 + 1 + 4 = 11 chars
    
    const existingWithSuffix = await prisma.user.findUnique({
      where: { username: candidateUsername }
    });
    
    if (!existingWithSuffix) {
      return candidateUsername;
    }
  }
  
  // Fallback: use UUID-based username (should never reach here)
  const fallbackId = crypto.randomUUID().split('-')[0];
  return `user_${fallbackId}`;
}
