import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Get kuji stock information (public endpoint)
 * GET /api/kuji/stock
 */
export async function getStock(req: Request, res: Response) {
  try {
    const cacheKey = 'kuji_stock';
    const now = Date.now();

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return res.status(200).json({
        ...cached.data,
        cached: true,
      });
    }

    // TODO: Replace with actual database query
    // For now, return mock data that matches the structure expected by the frontend
    const stockData = {
      tiers: [
        {
          id: 'S',
          name: 'S Tier',
          color: '#FFD700',
          totalStock: 5,
          remainingStock: 3,
          probability: 0.05,
          description: 'Ultra rare prizes',
        },
        {
          id: 'A',
          name: 'A Tier',
          color: '#C0C0C0',
          totalStock: 20,
          remainingStock: 15,
          probability: 0.15,
          description: 'Premium prizes',
        },
        {
          id: 'B',
          name: 'B Tier',
          color: '#CD7F32',
          totalStock: 50,
          remainingStock: 40,
          probability: 0.30,
          description: 'High quality prizes',
        },
        {
          id: 'C',
          name: 'C Tier',
          color: '#4A90E2',
          totalStock: 100,
          remainingStock: 85,
          probability: 0.50,
          description: 'Standard prizes',
        },
      ],
      bonuses: [
        {
          id: 'last_one',
          name: 'Last One Bonus',
          description: 'Special prize for the last draw',
          available: true,
        },
        {
          id: 'first_draw',
          name: 'First Draw Bonus',
          description: 'Extra prize for the first customer',
          available: false, // Already claimed
        },
      ],
      metadata: {
        totalDraws: 175,
        remainingDraws: 143,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Update cache
    cache.set(cacheKey, {
      data: stockData,
      timestamp: now,
    });

    return res.status(200).json({
      ...stockData,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch stock information',
    });
  }
}

/**
 * Get user-specific kuji stock information
 * GET /api/users/:username/stock
 */
export async function getUserStock(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const cacheKey = `kuji_stock_${username}`;
    const now = Date.now();

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return res.status(200).json({
        ...cached.data,
        cached: true,
      });
    }

    // Find user with prizes and settings
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        prizes: true,
        userSettings: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    // If user has no prizes, return empty stock data
    if (!user.prizes.length) {
      const emptyStockData = {
        tiers: [],
        bonuses: [],
        metadata: {
          totalDraws: 0,
          remainingDraws: 0,
          lastUpdated: new Date().toISOString(),
        },
      };

      cache.set(cacheKey, {
        data: emptyStockData,
        timestamp: now,
      });

      return res.status(200).json({
        ...emptyStockData,
        cached: false,
      });
    }

    // Process prizes into tier groups
    // Note: prize.quantity in the database represents REMAINING quantity after frontend syncs
    // Frontend updates LocalForage after each draw and syncs the remaining quantities to backend
    const tierGroups: { [key: string]: { prizes: any[], totalQuantity: number, remainingQuantity: number } } = {};
    
    // First pass: collect remaining quantities from database
    user.prizes.forEach(prize => {
      const tier = prize.tier.toUpperCase();
      if (!tierGroups[tier]) {
        tierGroups[tier] = {
          prizes: [],
          totalQuantity: 0,
          remainingQuantity: 0
        };
      }
      
      tierGroups[tier].prizes.push(prize);
      tierGroups[tier].remainingQuantity += prize.quantity;
    });

    // Get draw history to calculate original total quantities
    const drawSessions = await prisma.drawSession.findMany({
      where: { userId: user.id },
      include: {
        drawResults: true
      }
    });

    // Count total draws per tier from history
    const drawnPerTier: { [key: string]: number } = {};
    drawSessions.forEach(session => {
      session.drawResults.forEach(result => {
        const tier = result.tier.toUpperCase();
        drawnPerTier[tier] = (drawnPerTier[tier] || 0) + 1;
      });
    });

    console.log(`📊 User ${username} - Drawn per tier from history:`, drawnPerTier);

    // Second pass: calculate total quantity (remaining + drawn)
    Object.keys(tierGroups).forEach(tier => {
      const group = tierGroups[tier];
      if (group) {
        const remainingQty = group.remainingQuantity;
        const drawnQty = drawnPerTier[tier] || 0;
        group.totalQuantity = remainingQty + drawnQty;
        console.log(`📦 Tier ${tier}: remaining=${remainingQty}, drawn=${drawnQty}, total=${group.totalQuantity}`);
      }
    });

    // Get tier colors from user settings
    let tierColors: { [key: string]: string } = {};
    try {
      console.log(`🎨 Loading tier colors for ${username}:`, user.userSettings?.tierColors);
      tierColors = user.userSettings?.tierColors ? JSON.parse(user.userSettings.tierColors) : {};
      console.log(`🎨 Parsed tier colors:`, tierColors);
    } catch (error) {
      console.warn('Failed to parse tierColors JSON:', error);
      tierColors = {};
    }
    // Color palette ID to hex code mapping (from frontend colorPalette.js)
    const paletteToHex: { [key: string]: string } = {
      'amber': '#F59E0B',
      'sky': '#38BDF8',
      'emerald': '#10B981',
      'purple': '#A855F7',
      'rose': '#F43F5E',
      'lime': '#84CC16',
      'teal': '#14B8A6',
      'cyan': '#06B6D4',
      'violet': '#8B5CF6',
      'fuchsia': '#D946EF',
      'indigo': '#6366F1',
      'orange': '#F97316',
      'yellow': '#FACC15',
      'green': '#22C55E',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'pink': '#EC4899',
      'stone': '#A8A29E',
      'slate': '#94A3B8',
      'amber-dark': '#D97706',
      'sky-dark': '#0284C7',
      'emerald-dark': '#059669',
      'purple-dark': '#7C3AED',
      'rose-dark': '#E11D48',
      'orange-dark': '#EA580C',
      'blue-dark': '#2563EB',
      'green-dark': '#16A34A',
      'teal-dark': '#0F766E',
      'cyan-dark': '#0891B2',
      'violet-dark': '#6D28D9'
    };
    
    const defaultColors: { [key: string]: string } = {
      'S': '#FFD700',
      'A': '#C0C0C0', 
      'B': '#CD7F32',
      'C': '#4A90E2',
      'D': '#90EE90',
      'E': '#FFA500',
      'F': '#FF6347'
    };

    // Calculate total remaining for probability calculation
    const totalRemaining = Object.values(tierGroups).reduce((sum, group) => sum + group.remainingQuantity, 0);

    // Convert to tiers array
    const tiers = Object.entries(tierGroups).map(([tierId, group]) => {
      const totalStock = group.totalQuantity;
      const remainingStock = group.remainingQuantity;
      
      // Get color: custom tier color (convert palette ID to hex) → default color → fallback gray
      let color = '#6B7280'; // fallback
      if (tierColors[tierId]) {
        // User has custom color - convert palette ID to hex if needed
        color = paletteToHex[tierColors[tierId]] || tierColors[tierId];
      } else if (defaultColors[tierId]) {
        // Use default color for this tier
        color = defaultColors[tierId];
      }
      
      return {
        id: tierId,
        name: `${tierId} Tier`,
        color,
        totalStock,
        remainingStock,
        probability: totalRemaining > 0 ? remainingStock / totalRemaining : 0,
        description: group.prizes.map(p => p.prizeName).join(', ') || `${tierId} tier prizes`
      };
    });

    // Sort tiers based on user's custom tier order from settings
    // Get tier order from tierColors (object key order is preserved in JavaScript)
    const tierOrder = Object.keys(tierColors);
    
    if (tierOrder.length > 0) {
      // Custom order exists - use it
      const tierIndexMap = new Map(tierOrder.map((tier, index) => [tier.toUpperCase(), index]));
      
      tiers.sort((a, b) => {
        const indexA = tierIndexMap.has(a.id) ? tierIndexMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
        const indexB = tierIndexMap.has(b.id) ? tierIndexMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
        
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        
        // Fallback: S tier first, then alphabetically
        if (a.id === 'S' && b.id !== 'S') return -1;
        if (b.id === 'S' && a.id !== 'S') return 1;
        return a.id.localeCompare(b.id);
      });
    } else {
      // No custom order - default sorting (S tier first, then alphabetically)
      tiers.sort((a, b) => {
        if (a.id === 'S' && b.id !== 'S') return -1;
        if (b.id === 'S' && a.id !== 'S') return 1;
        return a.id.localeCompare(b.id);
      });
    }

    // Calculate metadata
    const totalDraws = tiers.reduce((sum, tier) => sum + tier.totalStock, 0);
    const remainingDraws = tiers.reduce((sum, tier) => sum + tier.remainingStock, 0);

    const stockData = {
      tiers,
      bonuses: [], // Could be extended to support bonuses from database
      metadata: {
        totalDraws,
        remainingDraws,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Update cache
    cache.set(cacheKey, {
      data: stockData,
      timestamp: now,
    });

    return res.status(200).json({
      ...stockData,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching user stock:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch user stock information',
    });
  }
}

/**
 * Clear stock cache (admin only, can be called after stock updates)
 */
export function clearStockCache() {
  cache.delete('kuji_stock');
}

/**
 * Clear user-specific stock cache
 */
export function clearUserStockCache(username: string) {
  const cacheKey = `kuji_stock_${username}`;
  const deleted = cache.delete(cacheKey);
  console.log(`Cache cleared for ${username}:`, deleted ? 'success' : 'not found');
  return deleted;
}
