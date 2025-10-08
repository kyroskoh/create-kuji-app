import { useState, useEffect, useMemo } from 'react';
import { hasAnalyticsAccess } from '../../utils/subscriptionPlans';
import { useAuth } from '../../utils/AuthContext';
import useLocalStorageDAO from '../../hooks/useLocalStorageDAO';
import { generateAnalyticsSummary } from '../../utils/analytics';
import { getTierColorHex } from '../../utils/tierColors';
import LineChart from '../Analytics/LineChart';
import BarChart from '../Analytics/BarChart';
import PieChart from '../Analytics/PieChart';

export default function UserAnalytics() {
  const { user } = useAuth();
  const { getHistory, getPrizes, getPricing, getSettings } = useLocalStorageDAO();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30); // days

  // Check if user has access
  const hasAccess = hasAnalyticsAccess(user?.subscriptionPlan || 'free');

  // Load data and generate analytics
  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      try {
        const [history, prizes, presets, settings] = await Promise.all([
          getHistory(),
          getPrizes(),
          getPricing(),
          getSettings()
        ]);

        if (mounted) {
          const summary = generateAnalyticsSummary({ history, prizes, presets });
          setAnalytics({ ...summary, settings });
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (hasAccess) {
      loadAnalytics();
    }

    return () => {
      mounted = false;
    };
  }, [hasAccess, getHistory, getPrizes, getPricing, getSettings]);

  // Transform tier distribution for pie chart
  const tierDistributionData = useMemo(() => {
    if (!analytics?.tiers?.distribution) return [];
    return Object.entries(analytics.tiers.distribution).map(([tier, count]) => ({
      label: `Tier ${tier}`,
      value: count
    }));
  }, [analytics]);

  // Transform most drawn prizes for bar chart
  const mostDrawnPrizesData = useMemo(() => {
    if (!analytics?.prizes?.mostDrawn || !analytics?.settings?.tierColors) return [];
    return analytics.prizes.mostDrawn
      .filter(item => item.prize) // Filter out items with undefined prize
      .slice(0, 10)
      .map(item => {
        const tierColor = getTierColorHex(item.tier, analytics.settings.tierColors);
        return {
          label: `${item.prize.substring(0, 15)}${item.prize.length > 15 ? '...' : ''}`,
          value: item.count,
          fullLabel: item.prize,
          tier: item.tier,
          tierColor: tierColor
        };
      });
  }, [analytics]);

  // Transform frequency data for area chart
  const frequencyData = useMemo(() => {
    if (!analytics?.draws?.frequency) return [];
    return analytics.draws.frequency.map(item => ({
      date: item.date,
      count: item.count
    }));
  }, [analytics]);

  // Transform cumulative data for line chart
  const cumulativeData = useMemo(() => {
    if (!analytics?.draws?.cumulative) return [];
    return analytics.draws.cumulative.map(item => ({
      date: item.date,
      count: item.count
    }));
  }, [analytics]);

  // Revenue data for line chart
  const revenueData = useMemo(() => {
    if (!analytics?.revenue?.revenueOverTime) return [];
    return analytics.revenue.revenueOverTime.map(item => ({
      date: item.date,
      revenue: item.cumulative
    }));
  }, [analytics]);

  if (!hasAccess) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analytics Available on Advanced & Pro Plans</h3>
        <p className="text-slate-400 mb-4">
          Upgrade to Advanced or Pro to access detailed analytics and insights.
        </p>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
          Upgrade Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Check if there's actually any data
  const hasData = analytics && (analytics.draws?.total > 0 || analytics.sessions?.totalSessions > 0);

  if (!analytics || !hasData) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Analytics Data Yet</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Start performing draws to see detailed analytics and insights about your kuji business.
        </p>
        <div className="bg-slate-900 rounded-lg p-6 max-w-lg mx-auto text-left">
          <h4 className="text-white font-semibold mb-3">What you'll see here:</h4>
          <ul className="text-slate-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Draw Statistics</strong> - Total draws, sessions, and trends over time</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Prize Analytics</strong> - Most drawn prizes and tier distribution</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Stock Management</strong> - Inventory levels and critical alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Revenue Tracking</strong> - Income trends and pricing performance</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Interactive Charts</strong> - Beautiful D3.js visualizations</span>
            </li>
          </ul>
        </div>
        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="#/draw"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Go to Draw Page
          </a>
          <a
            href="#/manage/prizes"
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Setup Prizes
          </a>
        </div>
      </div>
    );
  }

  const { draws, tiers, prizes, stock, sessions, revenue, settings } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1">
              Insights and statistics for your kuji draws
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Draws</p>
              <p className="text-3xl font-bold text-white mt-1">{draws.total.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold text-white mt-1">{sessions.totalSessions.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-1">
                Avg: {sessions.avgDrawsPerSession} draws/session
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                {settings?.currency || 'MYR'} {revenue.totalRevenue.toLocaleString()}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Avg: {settings?.currency || 'MYR'} {revenue.avgRevenuePerSession}/session
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Stock Remaining</p>
              <p className="text-3xl font-bold text-white mt-1">{stock.remainingStock.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-1">
                {stock.depletionRate}% depleted
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Session Info Cards */}
      {(sessions.mostActiveDay || sessions.mostActiveFan) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.mostActiveDay && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Most Active Day</h3>
              <p className="text-xl font-bold text-white">{sessions.mostActiveDay}</p>
            </div>
          )}
          {sessions.mostActiveFan && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Most Active Fan</h3>
              <p className="text-xl font-bold text-white">{sessions.mostActiveFan}</p>
            </div>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Draws Over Time */}
        {cumulativeData.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cumulative Draws Over Time</h3>
            <LineChart
              data={cumulativeData}
              xKey="date"
              yKey="count"
              color="#3b82f6"
              height={280}
              yLabel="Total Draws"
              showArea={true}
              showDots={false}
            />
          </div>
        )}

        {/* Tier Distribution */}
        {tierDistributionData.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tier Distribution</h3>
            <PieChart
              data={tierDistributionData}
              labelKey="label"
              valueKey="value"
              height={280}
              innerRadius={60}
              showLegend={true}
              showLabels={true}
            />
          </div>
        )}

        {/* Draw Frequency (Last 30 Days) */}
        {frequencyData.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Draw Frequency (Last 30 Days)</h3>
            <LineChart
              data={frequencyData}
              xKey="date"
              yKey="count"
              color="#8b5cf6"
              height={280}
              yLabel="Draws per Day"
              showArea={true}
              showDots={true}
            />
          </div>
        )}

        {/* Revenue Over Time */}
        {revenueData.length > 0 && revenue.totalRevenue > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cumulative Revenue</h3>
            <LineChart
              data={revenueData}
              xKey="date"
              yKey="revenue"
              color="#10b981"
              height={280}
              yLabel={`Revenue (${settings?.currency || 'MYR'})`}
              showArea={true}
              showDots={false}
            />
          </div>
        )}
      </div>

      {/* Most Drawn Prizes */}
      {mostDrawnPrizesData.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Most Drawn Prizes (Top 10)</h3>
          <BarChart
            data={mostDrawnPrizesData}
            xKey="label"
            yKey="value"
            colorKey="tierColor"
            height={350}
            yLabel="Draw Count"
            horizontal={true}
            showLabelsOnHover={true}
          />
        </div>
      )}

      {/* Critical Stock Items */}
      {stock.criticalItems && stock.criticalItems.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Critical Stock Items (Low Inventory)
          </h3>
          <div className="space-y-2">
            {stock.criticalItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-yellow-700/30"
              >
                <div>
                  <p className="text-white font-medium">{item.prize}</p>
                  <p className="text-slate-400 text-sm">Tier {item.tier}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">{item.remaining} left</p>
                  <p className="text-slate-500 text-sm">of {item.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {draws.total === 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
          <p className="text-slate-400">
            Start drawing prizes to see analytics and insights here.
          </p>
        </div>
      )}
    </div>
  );
}
