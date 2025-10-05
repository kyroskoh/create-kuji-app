import { Request, Response } from 'express';

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
 * Clear stock cache (admin only, can be called after stock updates)
 */
export function clearStockCache() {
  cache.delete('kuji_stock');
}
