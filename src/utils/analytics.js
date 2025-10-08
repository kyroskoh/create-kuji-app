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
 * Calculate draw frequency - bins draws by time periods (hourly or daily)
 * Dynamically adjusts granularity based on the time range
 * @param {Array} history - Draw history array
 * @param {number} days - Number of days to look back
 * @returns {Array} Array of { date, count } showing draws per time bin
 */
export function calculateDrawFrequency(history, days = 30) {
  if (!history.length) return [];
  
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  // Determine granularity: hourly for <= 7 days, daily for > 7 days
  const useHourlyBins = days <= 7;
  const bins = {};
  
  if (useHourlyBins) {
    // Create hourly bins for the last N days
    const totalHours = days * 24;
    for (let i = 0; i < totalHours; i++) {
      const date = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      const hourKey = `${date.toISOString().split('T')[0]} ${String(date.getHours()).padStart(2, '0')}:00`;
      bins[hourKey] = 0;
    }
    
    // Fill bins with draw counts
    history.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      if (sessionDate >= startDate && sessionDate <= now) {
        const hourKey = `${sessionDate.toISOString().split('T')[0]} ${String(sessionDate.getHours()).padStart(2, '0')}:00`;
        if (bins[hourKey] !== undefined) {
          bins[hourKey] += (session.draws?.length || 0);
        }
      }
    });
    
    return Object.entries(bins)
      .map(([dateStr, count]) => ({ 
        date: new Date(dateStr),
        count 
      }))
      .sort((a, b) => a.date - b.date);
  } else {
    // Create daily bins for longer periods
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      bins[dateKey] = 0;
    }
    
    // Fill bins with draw counts
    history.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      if (sessionDate >= startDate && sessionDate <= now) {
        const dateKey = sessionDate.toISOString().split('T')[0];
        if (bins[dateKey] !== undefined) {
          bins[dateKey] += (session.draws?.length || 0);
        }
      }
    });
    
    return Object.entries(bins)
      .map(([date, count]) => ({ 
        date: new Date(date),
        count 
      }))
      .sort((a, b) => a.date - b.date);
  }
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
 * Calculate stock depletion rate from current prize pool
 * @param {Array} prizes - Prize pool array (current state)
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
 * Calculate stock depletion from draw history (for event-specific analytics)
 * @param {Array} history - Draw history array (filtered for specific event)
 * @returns {Object} { totalDrawn, tierBreakdown, uniquePrizes }
 */
export function calculateStockDepletionFromHistory(history) {
  if (!history.length) {
    return {
      totalDrawn: 0,
      tierBreakdown: {},
      uniquePrizes: 0
    };
  }
  
  let totalDrawn = 0;
  const tierCounts = {};
  const uniquePrizesSet = new Set();
  
  history.forEach(session => {
    (session.draws || []).forEach(draw => {
      totalDrawn++;
      
      const tier = String(draw.tier || '?').toUpperCase();
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      
      // Track unique prizes
      if (draw.prize) {
        uniquePrizesSet.add(`${tier}:${draw.prize}`);
      }
    });
  });
  
  return {
    totalDrawn,
    tierBreakdown: tierCounts,
    uniquePrizes: uniquePrizesSet.size
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
  if (!history.length) {
    return {
      totalRevenue: 0,
      avgRevenuePerSession: 0,
      revenueByPreset: [],
      revenueOverTime: []
    };
  }
  
  // Create preset lookup map for sessions that used presets
  const presetMap = {};
  presets.forEach(preset => {
    presetMap[preset.label] = preset.price || 0;
  });
  
  let totalRevenue = 0;
  const presetRevenue = {};
  const revenueOverTime = [];
  let cumulativeRevenue = 0;
  
  history.forEach(session => {
    // Calculate revenue based on the pricing preset used for this session
    const label = session.label || 'Custom';
    
    // Get the preset price - this is the price for the entire draw session
    let sessionRevenue = presetMap[label] || 0;
    
    // For custom sessions without preset, revenue is 0
    if (label === 'Custom' && !presetMap[label]) {
      sessionRevenue = 0;
    }
    
    totalRevenue += sessionRevenue;
    cumulativeRevenue += sessionRevenue;
    
    // Track revenue by preset/label (label already declared above)
    if (!presetRevenue[label]) {
      presetRevenue[label] = { label, revenue: 0, count: 0 };
    }
    presetRevenue[label].revenue += sessionRevenue;
    presetRevenue[label].count++;
    
    // Track revenue over time
    revenueOverTime.push({
      date: new Date(session.timestamp),
      revenue: sessionRevenue,
      cumulative: cumulativeRevenue
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
 * Calculate revenue by event session
 * @param {Array} history - Draw history array
 * @param {Array} presets - Pricing presets array
 * @returns {Array} Array of { eventId, eventName, revenue, drawCount, sessions }
 */
export function calculateRevenueByEvent(history, presets) {
  // Create preset lookup map
  const presetMap = {};
  presets.forEach(preset => {
    presetMap[preset.label] = preset.price || 0;
  });
  
  // Group draw sessions by event
  const eventStats = {};
  
  history.forEach(session => {
    const eventId = session.eventId || 'no-event';
    const eventName = session.eventName || 'Legacy Draws';
    const label = session.label || 'Custom';
    const sessionRevenue = presetMap[label] || 0;
    
    if (!eventStats[eventId]) {
      eventStats[eventId] = {
        eventId,
        eventName,
        revenue: 0,
        drawCount: 0,
        sessionCount: 0
      };
    }
    
    eventStats[eventId].revenue += sessionRevenue;
    eventStats[eventId].drawCount += (session.draws?.length || 0);
    eventStats[eventId].sessionCount++;
  });
  
  return Object.values(eventStats)
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Generate comprehensive analytics summary
 * @param {Object} params - { history, prizes, presets, isFiltered, timeRangeDays }
 * @returns {Object} Complete analytics summary
 */
export function generateAnalyticsSummary({ 
  history = [], 
  prizes = [], 
  presets = [], 
  isFiltered = false, 
  timeRangeDays = 30 
}) {
  // If history is filtered (e.g., by event), calculate stock from draws instead of current prizes
  const stockStats = isFiltered 
    ? calculateStockDepletionFromHistory(history)
    : calculateStockDepletion(prizes);
  
  return {
    draws: {
      total: calculateTotalDraws(history),
      cumulative: calculateCumulativeDraws(history),
      frequency: calculateDrawFrequency(history, timeRangeDays)
    },
    tiers: {
      distribution: calculateTierDistribution(history),
      popularity: calculateTierPopularityOverTime(history, timeRangeDays)
    },
    prizes: {
      mostDrawn: calculateMostDrawnPrizes(history, 10)
    },
    stock: stockStats,
    sessions: calculateSessionStats(history),
    revenue: calculateRevenueStats(history, presets),
    revenueByEvent: calculateRevenueByEvent(history, presets)
  };
}
