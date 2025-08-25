import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'linear-config';

const defaultConfig = {
  enabled: false,
  teamId: '',
  projectId: '',
  syncInterval: 60000, // 1 minute in milliseconds
  autoSync: false,
  lastSyncedAt: null
};

function createLinearConfigStore() {
  // Initialize from localStorage if available
  const initialValue = browser ? 
    JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultConfig)) : 
    defaultConfig;

  const { subscribe, set, update } = writable(initialValue);

  return {
    subscribe,
    
    /**
     * Enable or disable Linear integration
     */
    setEnabled: (enabled) => update(config => {
      const newConfig = { ...config, enabled };
      
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
      
      return newConfig;
    }),
    
    /**
     * Set the Linear team ID
     */
    setTeamId: (teamId) => update(config => {
      const newConfig = { ...config, teamId };
      
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
      
      return newConfig;
    }),
    
    /**
     * Set the Linear project ID
     */
    setProjectId: (projectId) => update(config => {
      const newConfig = { ...config, projectId };
      
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
      
      return newConfig;
    }),
    
    /**
     * Set the synchronization interval
     */
    setSyncInterval: (syncInterval) => update(config => {
      const newConfig = { ...config, syncInterval };
      
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
      
      return newConfig;
    }),
    
    /**
     * Enable or disable auto-synchronization
     */
    setAutoSync: (autoSync) => update(config => {
      const newConfig = { ...config, autoSync };
      
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
      
      return newConfig;
    }),
    
    /**
     * Update the last synced timestamp
     */
    updateLastSyncedAt: () => update(config => {
      const newConfig = { ...config, lastSyncedAt: new Date().toISOString() };
      
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
      
      return newConfig;
    }),
    
    /**
     * Reset the configuration to defaults
     */
    reset: () => {
      set(defaultConfig);
      
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    
    /**
     * Get the current config value
     */
    getValue: () => get({ subscribe })
  };
}

export const linearConfig = createLinearConfigStore();