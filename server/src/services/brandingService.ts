import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BrandingData {
  companyName?: string | null;
  eventName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  backgroundPattern?: string | null;
  backgroundImage?: string | null;
  footerText?: string | null;
}

/**
 * Get branding by username (public endpoint)
 */
export async function getBrandingByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { userBranding: true }
  });

  if (!user) {
    return null;
  }

  // Return branding data or null if not set
  return user.userBranding || null;
}

/**
 * Create or update branding for a user
 */
export async function createOrUpdateBranding(userId: string, brandingData: BrandingData) {
  // Validate data size (especially for images stored as Base64)
  if (brandingData.logoUrl && brandingData.logoUrl.length > 1000000) {
    throw new Error('Logo size exceeds maximum allowed size');
  }
  
  if (brandingData.backgroundImage && brandingData.backgroundImage.length > 1000000) {
    throw new Error('Background image size exceeds maximum allowed size');
  }

  // Upsert branding
  const branding = await prisma.userBranding.upsert({
    where: { userId },
    update: {
      companyName: brandingData.companyName,
      eventName: brandingData.eventName,
      logoUrl: brandingData.logoUrl,
      primaryColor: brandingData.primaryColor || '#3b82f6',
      secondaryColor: brandingData.secondaryColor || '#8b5cf6',
      accentColor: brandingData.accentColor || '#06b6d4',
      fontFamily: brandingData.fontFamily || 'Inter',
      backgroundPattern: brandingData.backgroundPattern,
      backgroundImage: brandingData.backgroundImage,
      footerText: brandingData.footerText
    },
    create: {
      userId,
      companyName: brandingData.companyName,
      eventName: brandingData.eventName,
      logoUrl: brandingData.logoUrl,
      primaryColor: brandingData.primaryColor || '#3b82f6',
      secondaryColor: brandingData.secondaryColor || '#8b5cf6',
      accentColor: brandingData.accentColor || '#06b6d4',
      fontFamily: brandingData.fontFamily || 'Inter',
      backgroundPattern: brandingData.backgroundPattern,
      backgroundImage: brandingData.backgroundImage,
      footerText: brandingData.footerText
    }
  });

  return branding;
}

/**
 * Delete branding for a user
 */
export async function deleteBranding(userId: string) {
  try {
    await prisma.userBranding.delete({
      where: { userId }
    });
    return true;
  } catch (error) {
    // If branding doesn't exist, that's fine
    return false;
  }
}

/**
 * Check if user has custom branding feature access
 */
export async function hasCustomBrandingAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userSettings: true }
  });

  if (!user || !user.userSettings) {
    return false;
  }

  const subscriptionPlan = user.userSettings.subscriptionPlan || 'free';
  
  // Only Pro plan has custom branding
  return subscriptionPlan.toLowerCase() === 'pro';
}
