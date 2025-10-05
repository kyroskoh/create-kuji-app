import { kujiAPI } from '../utils/api';
import localforage from 'localforage';

// LocalForage store keys (same as in useLocalStorageDAO)
const STORE_KEYS = {
  prizes: "create::prizes",
  pricing: "create::pricing",
  history: "create::history",
  settings: "create::settings"
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
    this.pendingSyncs = new Set();
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingSyncs();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Sync all LocalForage data to backend for a user
  async syncAllData(username) {
    if (!username || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Starting full sync for user: ${username}`);

    try {
      // Load all data from LocalForage directly
      const [prizes, settings, history, presets] = await Promise.all([
        localforage.getItem(STORE_KEYS.prizes).then(data => Array.isArray(data) ? data : []),
        localforage.getItem(STORE_KEYS.settings),
        localforage.getItem(STORE_KEYS.history).then(data => Array.isArray(data) ? data : []),
        localforage.getItem(STORE_KEYS.pricing).then(data => Array.isArray(data) ? data : [])
      ]);

      // Sync each data type
      const syncPromises = [];
      
      if (prizes.length > 0) {
        syncPromises.push(
          kujiAPI.syncPrizes(username, prizes)
            .then(() => console.log(`✓ Synced ${prizes.length} prizes`))
            .catch(error => console.error('Failed to sync prizes:', error))
        );
      }

      if (settings) {
        syncPromises.push(
          kujiAPI.syncSettings(username, settings)
            .then(() => console.log('✓ Synced settings'))
            .catch(error => console.error('Failed to sync settings:', error))
        );
      }

      if (history.length > 0) {
        syncPromises.push(
          kujiAPI.syncHistory(username, history)
            .then(() => console.log(`✓ Synced ${history.length} history entries`))
            .catch(error => console.error('Failed to sync history:', error))
        );
      }

      if (presets.length > 0) {
        syncPromises.push(
          kujiAPI.syncPresets(username, presets)
            .then(() => console.log(`✓ Synced ${presets.length} presets`))
            .catch(error => console.error('Failed to sync presets:', error))
        );
      }

      // Wait for all syncs to complete
      await Promise.allSettled(syncPromises);
      
      console.log(`✅ Full sync completed for user: ${username}`);
      return { success: true };

    } catch (error) {
      console.error('Error during full sync:', error);
      return { success: false, error };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync specific data type
  async syncData(username, dataType, data) {
    if (!username || !this.isOnline) {
      this.pendingSyncs.add({ username, dataType, data });
      return;
    }

    try {
      switch (dataType) {
        case 'prizes':
          await kujiAPI.syncPrizes(username, data);
          break;
        case 'settings':
          await kujiAPI.syncSettings(username, data);
          break;
        case 'history':
          await kujiAPI.syncHistory(username, data);
          break;
        case 'presets':
          await kujiAPI.syncPresets(username, data);
          break;
        default:
          console.warn(`Unknown data type for sync: ${dataType}`);
          return;
      }
      
      console.log(`✓ Synced ${dataType} for user: ${username}`);
    } catch (error) {
      console.error(`Failed to sync ${dataType}:`, error);
      // Add to pending syncs for retry
      this.pendingSyncs.add({ username, dataType, data });
    }
  }

  // Process any pending syncs when coming back online
  async processPendingSyncs() {
    if (!this.isOnline || this.pendingSyncs.size === 0) {
      return;
    }

    console.log(`Processing ${this.pendingSyncs.size} pending syncs...`);
    
    const syncsToProcess = Array.from(this.pendingSyncs);
    this.pendingSyncs.clear();

    for (const { username, dataType, data } of syncsToProcess) {
      await this.syncData(username, dataType, data);
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