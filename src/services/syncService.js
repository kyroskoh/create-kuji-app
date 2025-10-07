import { kujiAPI } from '../utils/api';
import localforage from 'localforage';

// LocalForage store keys (same as in useLocalStorageDAO)
const STORE_KEYS = {
  prizes: "create::prizes",
  pricing: "create::pricing",
  history: "create::history",
  settings: "create::settings",
  branding: "create::branding",
  syncQueue: "create::sync_queue", // Persistent sync queue
  dirtyState: "create::dirty_state" // Track unsaved changes
};

// Configure LocalForage (same as in useLocalStorageDAO)
localforage.config({
  name: "create-kuji",
  storeName: "caris_kuji_store"
});

// Sync service to sync LocalForage data to backend
class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.syncInProgress = false;
    this.retryAttempts = new Map(); // Track retry attempts per operation
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
    
    // Initialize: load persisted queue from storage
    this.initializeQueue();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored - processing pending syncs');
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      console.log('📡 Connection lost - queueing syncs');
      this.isOnline = false;
    });

    // Periodic sync check (every 30 seconds)
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000);
  }

  // Initialize queue from persistent storage
  async initializeQueue() {
    try {
      const persistedQueue = await localforage.getItem(STORE_KEYS.syncQueue);
      if (Array.isArray(persistedQueue) && persistedQueue.length > 0) {
        this.syncQueue = persistedQueue;
        console.log(`📦 Restored ${persistedQueue.length} queued syncs from storage`);
        
        // Try to process if online
        if (this.isOnline) {
          this.processSyncQueue();
        }
      }
    } catch (error) {
      console.error('Failed to initialize sync queue:', error);
    }
  }

  // Persist queue to storage
  async persistQueue() {
    try {
      await localforage.setItem(STORE_KEYS.syncQueue, this.syncQueue);
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }

  // Add operation to queue
  async addToQueue(operation) {
    const queueItem = {
      ...operation,
      id: `${operation.username}_${operation.dataType}_${Date.now()}`,
      timestamp: Date.now(),
      attempts: 0
    };
    
    this.syncQueue.push(queueItem);
    await this.persistQueue();
    console.log(`➕ Added ${operation.dataType} sync to queue (${this.syncQueue.length} items)`);
  }

  // Remove operation from queue
  async removeFromQueue(id) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.persistQueue();
  }

  // Pull data from server and update local storage
  async pullDataFromServer(username, options = {}) {
    if (!username || !this.isOnline) {
      console.log('Cannot pull data: offline or no username');
      return { success: false };
    }

    console.log(`⬇️ Pulling latest data from server for ${username}...`);

    try {
      // Get current local data and dirty state to check for unsaved changes
      const localPrizes = await localforage.getItem(STORE_KEYS.prizes);
      const localHistory = await localforage.getItem(STORE_KEYS.history);
      const dirtyState = await localforage.getItem(STORE_KEYS.dirtyState) || {};
      
      // Fetch all data from server
      const [prizesResponse, settingsResponse, presetsResponse, brandingResponse] = await Promise.allSettled([
        kujiAPI.getUserPrizes(username),
        kujiAPI.getUserSettings(username),
        kujiAPI.getUserPresets(username),
        kujiAPI.getUserBranding(username)
      ]);

      // Update local storage with server data
      // IMPORTANT: For prizes, only pull if no unsaved local changes
      if (prizesResponse.status === 'fulfilled' && prizesResponse.value.data.prizes) {
        const serverPrizes = prizesResponse.value.data.prizes;
        
        // Check if prizes have unsaved changes (dirty flag)
        const hasDirtyPrizes = dirtyState.prizes === true;
        
        // Only overwrite prizes if:
        // 1. Forced pull (options.forcePrizes === true), OR
        // 2. No unsaved changes (not dirty)
        const shouldPullPrizes = options.forcePrizes || !hasDirtyPrizes;
        
        if (shouldPullPrizes) {
          await localforage.setItem(STORE_KEYS.prizes, serverPrizes);
          console.log(`✅ Pulled ${serverPrizes.length} prizes from server`);
        } else {
          console.log(`⚠️ Skipped pulling prizes - unsaved local changes detected (dirty flag set)`);
        }
      }

      // Settings - always pull (they sync immediately)
      if (settingsResponse.status === 'fulfilled' && settingsResponse.value.data) {
        await localforage.setItem(STORE_KEYS.settings, settingsResponse.value.data);
        console.log('✅ Pulled settings from server');
      }

      // Pricing presets - check dirty flag
      if (presetsResponse.status === 'fulfilled' && presetsResponse.value.data.presets) {
        const hasDirtyPricing = dirtyState.pricing === true;
        const shouldPullPricing = options.forcePricing || !hasDirtyPricing;
        
        if (shouldPullPricing) {
          await localforage.setItem(STORE_KEYS.pricing, presetsResponse.value.data.presets);
          console.log(`✅ Pulled ${presetsResponse.value.data.presets.length} pricing presets from server`);
        } else {
          console.log(`⚠️ Skipped pulling pricing - unsaved local changes detected (dirty flag set)`);
        }
      }

      // Branding - check dirty flag
      if (brandingResponse.status === 'fulfilled' && brandingResponse.value.data.branding) {
        const hasDirtyBranding = dirtyState.branding === true;
        const shouldPullBranding = options.forceBranding || !hasDirtyBranding;
        
        if (shouldPullBranding) {
          await localforage.setItem(STORE_KEYS.branding, brandingResponse.value.data.branding);
          console.log('✅ Pulled branding from server');
        } else {
          console.log('⚠️ Skipped pulling branding - unsaved local changes detected (dirty flag set)');
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Error pulling data from server:', error);
      return { success: false, error };
    }
  }

  // Push local data to server (full sync)
  async pushDataToServer(username) {
    if (!username) {
      return { success: false };
    }

    console.log(`⬆️ Pushing local data to server for ${username}...`);

    try {
      // Load all data from LocalForage
      const [prizes, settings, history, presets, branding] = await Promise.all([
        localforage.getItem(STORE_KEYS.prizes).then(data => Array.isArray(data) ? data : []),
        localforage.getItem(STORE_KEYS.settings),
        localforage.getItem(STORE_KEYS.history).then(data => Array.isArray(data) ? data : []),
        localforage.getItem(STORE_KEYS.pricing).then(data => Array.isArray(data) ? data : []),
        localforage.getItem(STORE_KEYS.branding)
      ]);

      // Queue each data type for sync
      const syncOperations = [];
      
      if (prizes.length > 0) {
        syncOperations.push({ username, dataType: 'prizes', data: prizes });
      }

      if (settings) {
        syncOperations.push({ username, dataType: 'settings', data: settings });
      }

      if (history.length > 0) {
        syncOperations.push({ username, dataType: 'history', data: history });
      }

      if (presets.length > 0) {
        syncOperations.push({ username, dataType: 'presets', data: presets });
      }

      if (branding) {
        syncOperations.push({ username, dataType: 'branding', data: branding });
      }

      // Add all to queue
      for (const operation of syncOperations) {
        await this.addToQueue(operation);
      }

      // Process queue
      if (this.isOnline) {
        await this.processSyncQueue();
      }
      
      return { success: true };

    } catch (error) {
      console.error('Error pushing data to server:', error);
      return { success: false, error };
    }
  }

  // Bidirectional sync: pull from server first, then push local changes
  async syncAllData(username) {
    if (!username || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Starting bidirectional sync for user: ${username}`);

    try {
      // Step 1: Pull latest data from server
      await this.pullDataFromServer(username);
      
      // Step 2: Push any local changes to server
      await this.pushDataToServer(username);
      
      console.log(`✨ Bidirectional sync completed for user: ${username}`);
      return { success: true };

    } catch (error) {
      console.error('Error during bidirectional sync:', error);
      return { success: false, error };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process sync queue with retry logic
  async processSyncQueue() {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Processing ${this.syncQueue.length} queued syncs...`);

    // Process queue items one by one
    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue[0];
      
      try {
        // Perform sync based on data type
        await this.executeSyncOperation(item);
        
        // Success - remove from queue
        await this.removeFromQueue(item.id);
        console.log(`✅ Synced ${item.dataType} for ${item.username}`);
        
      } catch (error) {
        console.error(`❌ Failed to sync ${item.dataType}:`, error);
        
        // Increment attempts
        item.attempts = (item.attempts || 0) + 1;
        
        if (item.attempts >= this.maxRetries) {
          console.warn(`⚠️ Max retries reached for ${item.dataType}, removing from queue`);
          await this.removeFromQueue(item.id);
        } else {
          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, item.attempts - 1);
          console.log(`🔁 Retrying ${item.dataType} in ${delay}ms (attempt ${item.attempts}/${this.maxRetries})`);
          
          // Move to end of queue and wait before retry
          this.syncQueue.shift();
          this.syncQueue.push(item);
          await this.persistQueue();
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.syncInProgress = false;
    
    if (this.syncQueue.length === 0) {
      console.log('✨ All syncs completed!');
    }
  }

  // Execute a single sync operation
  async executeSyncOperation(item) {
    const { username, dataType, data } = item;
    
    switch (dataType) {
      case 'prizes':
        return await kujiAPI.syncPrizes(username, data);
      case 'settings':
        return await kujiAPI.syncSettings(username, data);
      case 'history':
        return await kujiAPI.syncHistory(username, data);
      case 'presets':
        return await kujiAPI.syncPresets(username, data);
      case 'pricing':
        // Alias for presets - both refer to pricing data
        return await kujiAPI.syncPresets(username, data);
      case 'branding':
        return await kujiAPI.syncBranding(username, data);
      default:
        throw new Error(`Unknown data type for sync: ${dataType}`);
    }
  }

  // Sync specific data type (public API)
  async syncData(username, dataType, data) {
    if (!username) {
      console.warn('Cannot sync: username is required');
      return;
    }

    // Add to queue (will be processed immediately if online, or later if offline)
    await this.addToQueue({ username, dataType, data });
    
    // Try to process immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  // Check if sync is needed by comparing local and remote data
  async shouldSync(username) {
    try {
      const localPrizes = await localforage.getItem(STORE_KEYS.prizes);
      
      // If user has local data but no remote data, sync is needed
      if (Array.isArray(localPrizes) && localPrizes.length > 0) {
        try {
          const response = await kujiAPI.getUserPrizes(username);
          return response.data.prizes.length === 0; // Sync if remote is empty
        } catch (error) {
          // If API call fails, assume sync is needed
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true; // Err on the side of syncing
    }
  }

  // Auto-sync when user logs in
  async onUserLogin(username) {
    if (!username) return;
    
    console.log(`User logged in: ${username}, checking sync status...`);
    
    const needsSync = await this.shouldSync(username);
    
    if (needsSync) {
      console.log('Local data detected, initiating sync...');
      await this.syncAllData(username);
    } else {
      console.log('User data already synced');
    }
  }
}

// Create singleton instance
export const syncService = new SyncService();

// Helper function to trigger sync on login
export const triggerSyncOnLogin = (username) => {
  return syncService.onUserLogin(username);
};

// Helper function to sync specific data
export const syncUserData = (username, dataType, data) => {
  return syncService.syncData(username, dataType, data);
};

export default syncService;