import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { kujiAPI } from '../utils/api';

export default function DemoStock() {
  const location = useLocation();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TITLE = 'Demo Kuji Stock';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch actual demo user's stock data instead of mock data
        const response = await kujiAPI.getUserStock('demo');
        setStockData(response.data);
      } catch (err) {
        console.error('Error loading demo stock:', err);
        setError('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    })();
  }, [location.key]); // Reload when navigating to this page

  const refreshStock = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch actual demo user's stock data instead of mock data
      const response = await kujiAPI.getUserStock('demo');
      setStockData(response.data);
    } catch (err) {
      console.error('Error refreshing stock:', err);
      setError('Failed to refresh stock data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshStock}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          <br />
          <Link
            to="/demo"
            className="inline-block mt-4 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Demo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{TITLE}</h1>
          <p className="text-slate-400 mb-6">
            View available prizes and their probabilities (Public Demo)
          </p>
          <Link
            to="/demo"
            className="inline-block px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Demo
          </Link>
        </div>

        {stockData && stockData.tiers && stockData.tiers.length > 0 ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
                <p className="text-slate-400 text-sm mb-1">Total Draws</p>
                <p className="text-3xl font-bold text-white">{stockData.metadata.totalDraws}</p>
              </div>
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
                <p className="text-slate-400 text-sm mb-1">Remaining</p>
                <p className="text-3xl font-bold text-green-400">{stockData.metadata.remainingDraws}</p>
              </div>
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
                <p className="text-slate-400 text-sm mb-1">Last Updated</p>
                <p className="text-lg font-medium text-white">
                  {new Date(stockData.metadata.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Prize Tiers */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Prize Tiers</h2>
              <div className="space-y-4">
                {stockData.tiers.map((tier) => {
                  const percentage = (tier.remainingStock / tier.totalStock) * 100;
                  
                  return (
                    <div
                      key={tier.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: tier.color }}
                          >
                            {tier.id}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                            <p className="text-sm text-slate-400">{tier.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {tier.remainingStock}/{tier.totalStock}
                          </p>
                          <p className="text-sm text-slate-400">
                            {(tier.probability * 100).toFixed(1)}% chance
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: tier.color,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {percentage.toFixed(1)}% remaining
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bonus Prizes */}
            {stockData.bonuses && stockData.bonuses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Bonus Prizes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stockData.bonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      className={`rounded-lg border p-6 ${
                        bonus.available
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-800/50 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{bonus.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            bonus.available
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-600 text-slate-400'
                          }`}
                        >
                          {bonus.available ? 'Available' : 'Claimed'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{bonus.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={refreshStock}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mr-4"
              >
                Refresh Stock Data
              </button>
              <Link
                to="/demo"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Demo Login 🎮
              </Link>
              {stockData.cached && (
                <p className="text-xs text-slate-500 mt-2">
                  (Cached data - updates every 30 seconds)
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center bg-slate-800 rounded-lg border border-slate-700 p-12">
            <p className="text-2xl text-slate-300 mb-4">No Prizes Available Yet</p>
            <p className="text-slate-400 mb-6">
              The demo user hasn't set up any prizes yet. Try the demo login to manage prizes!
            </p>
            <Link
              to="/demo"
              className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Demo Login 🎮
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
