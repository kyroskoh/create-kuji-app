// Analytics utilities for calculating statistics from draw history and prizes

/**
 * Calculate total draws from history
 * @param {Array} history - Draw history array
 * @returns {number} Total number of draws
 */
export function calculateTotalDraws(history) {
  return history.reduce((total, session) => {
    return total + (session.draws?.length || 0);
  }, 0);
}

/**
 * Calculate tier distribution from history
 * @param {Array} history - Draw history array
 * @returns {Object} Tier distribution { tier: count }
 */
export function calculateTierDistribution(history) {
  const distribution = {};
  
  history.forEach(session => {
    (session.draws || []).forEach(draw => {
      const tier = String(draw.tier || '?').toUpperCase();
      distribution[tier] = (distribution[tier] || 0) + 1;
    });
  });
  
  return distribution;
}

/**
 * Calculate most drawn prizes
 * @param {Array} history - Draw history array
 * @param {number} limit - Number of top prizes to return
 * @returns {Array} Array of { prize, count, tier }
 */
export function calculateMostDrawnPrizes(history, limit = 10) {
  const prizeCounts = {};
  
  history.forEach(session => {
    (session.draws || []).forEach(draw => {
      const key = `${draw.tier}:${draw.prize}`;
      if (!prizeCounts[key]) {
        prizeCounts[key] = {
          prize: draw.prize,
          tier: draw.tier,
          count: 0
        };
      }
      prizeCounts[key].count++;
    });
  });
  
  return Object.values(prizeCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculate draw frequency over time (binned by day)
 * @param {Array} history - Draw history array
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Array} Array of { date, count }
 */
export function calculateDrawFrequency(history, days = 30) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  // Create bins for each day
  const bins = {};
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().split('T')[0];
    bins[dateKey] = 0;
  }
  
  // Fill bins with draw counts
  history.forEach(session => {
    const sessionDate = new Date(session.timestamp);
    if (sessionDate >= startDate) {
      const dateKey = sessionDate.toISOString().split('T')[0];
      if (bins[dateKey] !== undefined) {
        bins[dateKey] += (session.draws?.length || 0);
      }
    }
  });
  
  return Object.entries(bins)
    .map(([date, count]) => ({ date: new Date(date), count }))
    .sort((a, b) => a.date - b.date);
}

/**
 * Calculate cumulative draws over time
 * @param {Array} history - Draw history array
 * @returns {Array} Array of { date, count } with cumulative totals
 */
export function calculateCumulativeDraws(history) {
  if (!history.length) return [];
  
  // Sort sessions by timestamp
  const sortedSessions = [...history].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  let cumulative = 0;
  const data = [];
  
  sortedSessions.forEach(session => {
    cumulative += (session.draws?.length || 0);
    data.push({
      date: new Date(session.timestamp),
      count: cumulative
    });
  });
  
  return data;
}

/**
 * Calculate stock depletion rate
 * @param {Array} prizes - Prize pool array
 * @returns {Object} { totalStock, remainingStock, depletionRate, criticalItems }
 */
export function calculateStockDepletion(prizes) {
  let totalStock = 0;
  let remainingStock = 0;
  const criticalItems = [];
  
  prizes.forEach(prize => {
    const total = Number(prize.quantity) || 0;
    totalStock += total;
    remainingStock += total;
    
    // Mark items with <20% stock remaining
    if (total > 0 && remainingStock / total < 0.2) {
      criticalItems.push({
        prize: prize.prize_name,
        tier: prize.tier,
        remaining: remainingStock,
        total
      });
    }
  });
  
  const depletionRate = totalStock > 0 
    ? ((totalStock - remainingStock) / totalStock) * 100 
    : 0;
  
  return {
    totalStock,
    remainingStock,
    depletionRate: Math.round(depletionRate * 10) / 10,
    criticalItems
  };
}

/**
 * Calculate session statistics
 * @param {Array} history - Draw history array
 * @returns {Object} Session stats
 */
export function calculateSessionStats(history) {
  if (!history.length) {
    return {
      totalSessions: 0,
      avgDrawsPerSession: 0,
      mostActiveDay: null,
      mostActiveFan: null
    };
  }
  
  const totalSessions = history.length;
  const totalDraws = calculateTotalDraws(history);
  const avgDrawsPerSession = Math.round((totalDraws / totalSessions) * 10) / 10;
  
  // Calculate most active day
  const dayCounts = {};
  history.forEach(session => {
    const date = new Date(session.timestamp);
    const dayKey = date.toLocaleDateString();
    dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
  });
  
  const mostActiveDay = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  // Calculate most active fan
  const fanCounts = {};
  history.forEach(session => {
    const fan = session.fanName || 'Unknown';
    fanCounts[fan] = (fanCounts[fan] || 0) + 1;
  });
  
  const mostActiveFan = Object.entries(fanCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  return {
    totalSessions,
    avgDrawsPerSession,
    mostActiveDay,
    mostActiveFan
  };
}

/**
 * Calculate revenue statistics (requires pricing presets)
 * @param {Array} history - Draw history array
 * @param {Array} presets - Pricing presets array
 * @returns {Object} Revenue stats
 */
export function calculateRevenueStats(history, presets) {
  if (!history.length || !presets.length) {
    return {
      totalRevenue: 0,
      avgRevenuePerSession: 0,
      revenueByPreset: [],
      revenueOverTime: []
    };
  }
  
  // Create preset lookup map
  const presetMap = {};
  presets.forEach(preset => {
    presetMap[preset.label] = preset.price || 0;
  });
  
  let totalRevenue = 0;
  const presetRevenue = {};
  const revenueOverTime = [];
  
  history.forEach(session => {
    const label = session.label || 'Custom';
    const price = presetMap[label] || 0;
    totalRevenue += price;
    
    // Track revenue by preset
    if (!presetRevenue[label]) {
      presetRevenue[label] = { label, revenue: 0, count: 0 };
    }
    presetRevenue[label].revenue += price;
    presetRevenue[label].count++;
    
    // Track revenue over time
    revenueOverTime.push({
      date: new Date(session.timestamp),
      revenue: price,
      cumulative: totalRevenue
    });
  });
  
  const avgRevenuePerSession = history.length > 0 
    ? Math.round((totalRevenue / history.length) * 100) / 100 
    : 0;
  
  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    avgRevenuePerSession,
    revenueByPreset: Object.values(presetRevenue)
      .sort((a, b) => b.revenue - a.revenue),
    revenueOverTime: revenueOverTime.sort((a, b) => a.date - b.date)
  };
}

/**
 * Calculate tier popularity over time
 * @param {Array} history - Draw history array
 * @param {number} days - Number of days to look back
 * @returns {Object} { [tier]: Array<{date, count}> }
 */
export function calculateTierPopularityOverTime(history, days = 30) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const tierTimeSeries = {};
  
  history.forEach(session => {
    const sessionDate = new Date(session.timestamp);
    if (sessionDate >= startDate) {
      (session.draws || []).forEach(draw => {
        const tier = String(draw.tier || '?').toUpperCase();
        if (!tierTimeSeries[tier]) {
          tierTimeSeries[tier] = [];
        }
        tierTimeSeries[tier].push({
          date: sessionDate,
          count: 1
        });
      });
    }
  });
  
  return tierTimeSeries;
}

/**
 * Generate comprehensive analytics summary
 * @param {Object} params - { history, prizes, presets }
 * @returns {Object} Complete analytics summary
 */
export function generateAnalyticsSummary({ history = [], prizes = [], presets = [] }) {
  return {
    draws: {
      total: calculateTotalDraws(history),
      cumulative: calculateCumulativeDraws(history),
      frequency: calculateDrawFrequency(history, 30)
    },
    tiers: {
      distribution: calculateTierDistribution(history),
      popularity: calculateTierPopularityOverTime(history, 30)
    },
    prizes: {
      mostDrawn: calculateMostDrawnPrizes(history, 10)
    },
    stock: calculateStockDepletion(prizes),
    sessions: calculateSessionStats(history),
    revenue: calculateRevenueStats(history, presets)
  };
}
