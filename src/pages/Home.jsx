import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useTranslation } from "../utils/TranslationContext.jsx";
import { useAuth } from "../utils/AuthContext.jsx";
import { useUserNavigation } from "../hooks/useUserNavigation.js";
import { kujiAPI } from '../utils/api';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getUserPageUrl } = useUserNavigation();
  const [stockData, setStockData] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);

  // Load stock data when user logs in
  useEffect(() => {
    if (user) {
      loadStock();
    }
  }, [user]);

  const loadStock = async () => {
    try {
      setStockLoading(true);
      const response = await kujiAPI.getStock();
      setStockData(response.data);
    } catch (error) {
      console.error('Failed to load stock:', error);
      setStockData(null);
    } finally {
      setStockLoading(false);
    }
  };
  
  // If user is logged in, show stock page content
  if (user) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8 min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.displayName || user.username}!</h1>
          <p className="text-slate-400 mb-6">
            View available prizes and their probabilities
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to={getUserPageUrl("draw")} className="block">
            <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              🎯 {t("home.startDrawing")}
            </button>
          </Link>
          {user.isSuperAdmin && (
            <Link to={getUserPageUrl("admin")} className="block">
              <button className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors">
                ⚙️ {t("home.adminArea")}
              </button>
            </Link>
          )}
        </div>

        {/* Stock Information */}
        {stockLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">Loading stock data...</p>
            </div>
          </div>
        ) : stockData ? (
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
                onClick={loadStock}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Refresh Stock Data
              </button>
              {stockData.cached && (
                <p className="text-xs text-slate-500 mt-2">
                  (Cached data - updates every 30 seconds)
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">Unable to load stock data</p>
            <button
              onClick={loadStock}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // If user is not logged in, show original homepage
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold text-white">{t("app.title")}</h1>
        <p className="text-slate-300">
          {t("home.description")}
        </p>
        <div className="flex flex-col gap-4 pt-4">
          <Link to="/demo" className="block w-full">
            <button className="w-full bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              🎮 Try Live Demo
            </button>
          </Link>
          <Link to="/login" className="block w-full">
            <button className="w-full bg-purple-700 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Sign In
            </button>
          </Link>
          <Link to="/signup" className="block w-full">
            <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}