import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { kujiAPI } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../utils/AuthContext';
import syncService from '../services/syncService';

export default function Stock() {
  const { username: paramUsername } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  // Handle demo route - use 'demo' as username when no param username
  const username = paramUsername || 'demo';
  const [stockData, setStockData] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadStock();
  }, [username, location.key]); // Reload when username changes or when navigating to this page

  const loadStock = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // If this is the current user and force refresh is requested, do bidirectional sync first
      if (forceRefresh && user?.username === username) {
        try {
          console.log('🔄 Performing bidirectional sync before refreshing stock...');
          await syncService.syncAllData(username);
          console.log('✅ Sync completed, now fetching updated stock');
        } catch (syncError) {
          console.warn('⚠️ Sync error (continuing with stock fetch):', syncError);
        }
      }
      
      // Check if stock page is published
      const statusResponse = await kujiAPI.getStockPageStatus(username);
      const { stockPagePublished } = statusResponse.data;
      const isOwner = user?.username === username;
      
      // Debug logging
      console.log('📊 Stock Page Access Check:');
      console.log('   Username:', username);
      console.log('   Is Owner:', isOwner);
      console.log('   Stock Page Published:', stockPagePublished);
      console.log('   Will Block Access:', !stockPagePublished && !isOwner);
      
      // If not published and not owner, block access
      if (!stockPagePublished && !isOwner) {
        setUserSettings({ stockPagePublished });
        setStockData(null);
        setLoading(false);
        return;
      }
      
      // Stock is published or user is owner - fetch stock data
      const stockResponse = await kujiAPI.getUserStock(username);
      setStockData(stockResponse.data);
      setUserSettings({ stockPagePublished });
      
      if (forceRefresh) {
        toast.success('Stock data refreshed');
      }
    } catch (error) {
      console.error('Error loading user stock:', error);
      toast.error(`Failed to load stock information for ${username}`);
    } finally {
      setLoading(false);
    }
  };

  // Backend already sorts tiers based on user's custom order, just use directly
  const sortedTiers = stockData?.tiers || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading stock data...</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.username === username;
  const isPublished = userSettings?.stockPagePublished;

  // Show unpublished message for non-owners
  if (!stockData && !isOwner && userSettings && !isPublished) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
            <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Stock Page Unpublished</h2>
            <p className="text-slate-400 mb-4">
              The stock page for <span className="text-white font-semibold">{username}</span> is currently not available to the public.
            </p>
            <p className="text-sm text-slate-500">
              The owner has not published their stock page yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show unpublished banner for owners
  if (!stockData && isOwner && userSettings && !isPublished) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-8">
            <svg className="w-16 h-16 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Your Stock Page is Unpublished</h2>
            <p className="text-slate-300 mb-4">
              Your stock page is currently not visible to the public. 
            </p>
            <p className="text-sm text-slate-400">
              Go to Settings to publish your stock page and make it publicly accessible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-400">Failed to load stock data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{username}'s Kuji Stock</h1>
        <p className="text-slate-400">
          View available prizes and their probabilities for {username}
        </p>
      </div>

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
          {sortedTiers.map((tier) => {
            const percentage = tier.totalStock > 0 
              ? (tier.remainingStock / tier.totalStock) * 100 
              : 0;
            
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

      {/* Refresh Info */}
      <div className="text-center">
        <button
          onClick={() => loadStock(true)}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh Stock Data'}
        </button>
        {stockData.cached && (
          <p className="text-xs text-slate-500 mt-2">
            (Cached data - updates every 30 seconds)
          </p>
        )}
      </div>
    </div>
  );
}
