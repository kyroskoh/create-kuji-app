import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { clearUserStockCache } from './kujiController';
import { getDefaultUserSettings } from '../utils/defaultSettings';

const prisma = new PrismaClient();

/**
 * Sync user prizes from LocalForage to database
 * POST /api/users/:username/sync-prizes
 */
export async function syncPrizes(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const { prizes } = req.body;

    if (!Array.isArray(prizes)) {
      return res.status(400).json({
        error: 'INVALID_DATA',
        message: 'Prizes must be an array'
      });
    }

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

    // Delete existing prizes for this user
    await prisma.prize.deleteMany({
      where: { userId: user.id }
    });

    // Create new prizes
    const prizeData = prizes.map((prize: any) => ({
      userId: user.id,
      prizeName: prize.prize_name || prize.prizeName || 'Unknown Prize',
      tier: String(prize.tier || 'C').toUpperCase(),
      quantity: parseInt(prize.quantity) || 0,
      weight: parseFloat(prize.weight) || 1.0,
      sku: prize.sku || null,
      description: prize.description || null
    }));

    const createdPrizes = await prisma.prize.createMany({
      data: prizeData
    });

    // Clear the stock cache for this user so fresh data is fetched
    if (username) {
      clearUserStockCache(username);
    }

    return res.status(200).json({
      message: 'Prizes synced successfully',
      count: createdPrizes.count
    });

  } catch (error) {
    console.error('Error syncing prizes:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to sync prizes'
    });
  }
}

/**
 * Sync user settings from LocalForage to database  
 * POST /api/users/:username/sync-settings
 */
export async function syncSettings(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const settings = req.body;

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

    // Upsert user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        sessionStatus: settings.sessionStatus || 'INACTIVE',
        lastReset: settings.lastReset ? new Date(settings.lastReset) : null,
        country: settings.country || 'Malaysia',
        countryCode: settings.countryCode || 'MY',
        countryEmoji: settings.countryEmoji || '🇲🇾',
        currency: settings.currency || 'MYR',
        locale: settings.locale || 'ms-MY',
        tierColors: JSON.stringify(settings.tierColors || {}),
        nextSessionNumber: parseInt(settings.nextSessionNumber) || 1,
        weightMode: settings.weightMode || 'basic',
        subscriptionPlan: settings.subscriptionPlan || 'free'
      },
      create: {
        userId: user.id,
        sessionStatus: settings.sessionStatus || 'INACTIVE',
        lastReset: settings.lastReset ? new Date(settings.lastReset) : null,
        country: settings.country || 'Malaysia',
        countryCode: settings.countryCode || 'MY',
        countryEmoji: settings.countryEmoji || '🇲🇾',
        currency: settings.currency || 'MYR',
        locale: settings.locale || 'ms-MY',
        tierColors: JSON.stringify(settings.tierColors || {}),
        nextSessionNumber: parseInt(settings.nextSessionNumber) || 1,
        weightMode: settings.weightMode || 'basic',
        subscriptionPlan: settings.subscriptionPlan || 'free'
      }
    });

    // Clear the stock cache for this user so tier colors are updated
    if (username) {
      clearUserStockCache(username);
    }

    return res.status(200).json({
      message: 'Settings synced successfully',
      settings: userSettings
    });

  } catch (error) {
    console.error('Error syncing settings:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to sync settings'
    });
  }
}

/**
 * Sync draw history from LocalForage to database
 * POST /api/users/:username/sync-history
 */
export async function syncHistory(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const { history } = req.body;

    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: 'INVALID_DATA',
        message: 'History must be an array'
      });
    }

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

    // Clear existing history for this user
    await prisma.drawSession.deleteMany({
      where: { userId: user.id }
    });

    // Create draw sessions and results
    for (const sessionData of history) {
      const session = await prisma.drawSession.create({
        data: {
          userId: user.id,
          sessionNumber: parseInt(sessionData.sessionNumber) || 1,
          fanName: sessionData.fanName || 'Unknown',
          queueNumber: sessionData.queueNumber || null,
          label: sessionData.label || null,
          timestamp: sessionData.timestamp ? new Date(sessionData.timestamp) : new Date()
        }
      });

      if (sessionData.draws && Array.isArray(sessionData.draws)) {
        const drawResults = sessionData.draws.map((draw: any, index: number) => ({
          sessionId: session.id,
          drawIndex: index + 1,
          tier: String(draw.tier || 'C').toUpperCase(),
          prizeName: draw.prize || draw.prizeName || 'Unknown Prize',
          sku: draw.sku || null
        }));

        await prisma.drawResult.createMany({
          data: drawResults
        });
      }
    }

    return res.status(200).json({
      message: 'History synced successfully',
      sessionCount: history.length
    });

  } catch (error) {
    console.error('Error syncing history:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to sync history'
    });
  }
}

/**
 * Sync pricing presets from LocalForage to database
 * POST /api/users/:username/sync-presets
 */
export async function syncPricingPresets(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const { presets } = req.body;

    if (!Array.isArray(presets)) {
      return res.status(400).json({
        error: 'INVALID_DATA',
        message: 'Presets must be an array'
      });
    }

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

    // Delete existing presets for this user
    await prisma.pricingPreset.deleteMany({
      where: { userId: user.id }
    });

    // Create new presets
    const presetData = presets.map((preset: any) => ({
      userId: user.id,
      label: preset.label || 'Custom',
      drawCount: parseInt(preset.draw_count) || parseInt(preset.drawCount) || 1,
      bonusDraws: parseInt(preset.bonus_draws) || parseInt(preset.bonusDraws) || 0,
      price: parseFloat(preset.price) || 0
    }));

    const createdPresets = await prisma.pricingPreset.createMany({
      data: presetData
    });

    return res.status(200).json({
      message: 'Presets synced successfully',
      count: createdPresets.count
    });

  } catch (error) {
    console.error('Error syncing presets:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to sync presets'
    });
  }
}

/**
 * Get user's current prizes from database
 * GET /api/users/:username/prizes
 */
export async function getUserPrizes(req: Request, res: Response) {
  try {
    const { username } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        prizes: {
          orderBy: [
            { tier: 'asc' },
            { prizeName: 'asc' }
          ]
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      prizes: user.prizes
    });

  } catch (error) {
    console.error('Error getting user prizes:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to get user prizes'
    });
  }
}

/**
 * Get public info about user's stock page (for visibility check)
 * GET /api/users/:username/stock-status
 */
export async function getStockPageStatus(req: Request, res: Response) {
  try {
    const { username } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        userSettings: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // Return only public information needed for stock page visibility
    const settings = user.userSettings;
    const subscriptionPlan = settings?.subscriptionPlan || 'free';
    const sessionStatus = settings?.sessionStatus || 'INACTIVE';
    
    return res.status(200).json({
      subscriptionPlan,
      sessionStatus,
      stockPagePublished: sessionStatus === 'PUBLISHED',
      // Include tier colors for public viewing
      tierColors: settings?.tierColors ? JSON.parse(settings.tierColors) : {}
    });

  } catch (error) {
    console.error('Error getting stock page status:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to get stock page status'
    });
  }
}

/**
 * Get user's settings from database (authenticated)
 * GET /api/users/:username/settings
 */
export async function getUserSettings(req: Request, res: Response) {
  try {
    const { username } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        userSettings: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // If user doesn't have settings, create default ones
    let userSettings = user.userSettings;
    if (!userSettings) {
      console.log(`📝 Creating default settings for user ${username}`);
      userSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          ...getDefaultUserSettings()
        }
      });
    }

    // Parse tierColors from JSON string and format response for frontend
    const { tierColors, sessionStatus, ...rest } = userSettings;
    const settings = {
      ...rest,
      sessionStatus,
      tierColors: tierColors ? JSON.parse(tierColors) : {},
      // Add computed property for frontend compatibility
      stockPagePublished: sessionStatus === 'PUBLISHED'
    };

    return res.status(200).json(settings);

  } catch (error) {
    console.error('Error getting user settings:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to get user settings'
    });
  }
}