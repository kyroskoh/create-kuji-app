import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getBrandingByUsername,
  createOrUpdateBranding,
  hasCustomBrandingAccess,
  BrandingData
} from '../services/brandingService';

const prisma = new PrismaClient();

/**
 * Get branding for a user (public endpoint)
 * GET /api/users/:username/branding
 */
export async function getBranding(req: Request, res: Response) {
  try {
    const { username } = req.params;

    const branding = await getBrandingByUsername(username);

    if (!branding) {
      return res.status(404).json({
        error: 'BRANDING_NOT_FOUND',
        message: 'No branding configured for this user'
      });
    }

    return res.status(200).json({
      branding
    });

  } catch (error) {
    console.error('Error fetching branding:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch branding'
    });
  }
}

/**
 * Sync branding from LocalForage to database (authenticated endpoint)
 * POST /api/users/:username/branding/sync
 */
export async function syncBranding(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const brandingData: BrandingData = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Check if authenticated user matches the username
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || authenticatedUser.id !== user.id) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You can only sync your own branding'
      });
    }

    // Check if user has custom branding access
    const hasAccess = await hasCustomBrandingAccess(user.id);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Custom branding is only available on Pro plan'
      });
    }

    // Validate branding data
    if (typeof brandingData !== 'object') {
      return res.status(400).json({
        error: 'INVALID_DATA',
        message: 'Invalid branding data'
      });
    }

    // Create or update branding
    const branding = await createOrUpdateBranding(user.id, brandingData);

    return res.status(200).json({
      message: 'Branding synced successfully',
      branding
    });

  } catch (error: any) {
    console.error('Error syncing branding:', error);
    
    // Handle specific errors
    if (error.message && error.message.includes('size exceeds')) {
      return res.status(413).json({
        error: 'PAYLOAD_TOO_LARGE',
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to sync branding'
    });
  }
}

/**
 * Delete branding (authenticated endpoint)
 * DELETE /api/users/:username/branding
 */
export async function deleteBrandingController(req: Request, res: Response) {
  try {
    const { username } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Check if authenticated user matches the username
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || authenticatedUser.id !== user.id) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You can only delete your own branding'
      });
    }

    const { deleteBranding } = await import('../services/brandingService');
    await deleteBranding(user.id);

    return res.status(200).json({
      message: 'Branding deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting branding:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to delete branding'
    });
  }
}
