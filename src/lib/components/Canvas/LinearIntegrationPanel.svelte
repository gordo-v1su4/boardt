<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { linearConfig } from '$lib/stores/linearConfig.svelte.js';
  import { LinearService } from '$lib/mcp/linear/linearService';
  import { LinearSyncService } from '$lib/mcp/linear/syncService';
  import { createBoardtProject } from '$lib/mcp/linear/createProjectAndIssues';
  import type { LinearIssue } from '$lib/mcp/linear/types';

  // Define custom event handler type
  type MouseEventHandler = (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => void;

  // Props using Svelte 5 $props()
  let {
    selectedNodes = [],
    onClose = (() => {}) as MouseEventHandler
  } = $props();

  // Component state
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let lastSyncTime = $state<string | null>(null);
  
  // Status information
  let config = $state($linearConfig);
  let isSyncing = $state(false);
  let statusInfo = $state<{
    created: number;
    updated: number;
    synced: number;
    total: number;
  }>({
    created: 0,
    updated: 0,
    synced: 0,
    total: 0
  });
  
  // Message timeout
  let messageTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Subscribe to config changes
  const unsubscribe = linearConfig.subscribe(value => {
    config = value;
    lastSyncTime = value.lastSyncedAt ? new Date(value.lastSyncedAt).toLocaleString() : null;
  });
  
  onDestroy(() => {
    if (messageTimeout) clearTimeout(messageTimeout);
    unsubscribe();
  });
  
  // Get nodes with and without Linear issues
  $effect(() => {
    if (selectedNodes) {
      statusInfo.total = selectedNodes.length;
      statusInfo.synced = selectedNodes.filter(node => node.data.linearIssueId).length;
    }
  });
  
  // Create Linear issues for selected nodes
  async function createLinearIssues() {
    if (!config.enabled || !config.teamId || selectedNodes.length === 0) return;
    
    loading = true;
    isSyncing = true;
    error = null;
    
    try {
      let created = 0;
      let updated = 0;
      
      // Process each selected node
      for (const node of selectedNodes) {
        // Skip nodes that already have Linear issues
        if (node.data.linearIssueId) {
          const success = await LinearSyncService.updateIssueFromChunk(node.id);
          if (success) updated++;
          continue;
        }
        
        // Create a new issue
        const issueId = await LinearSyncService.createIssueFromChunk(node.id);
        if (issueId) created++;
      }
      
      statusInfo.created = created;
      statusInfo.updated = updated;
      
      if (created > 0 || updated > 0) {
        success = `${created} issues created, ${updated} issues updated`;
        
        messageTimeout = setTimeout(() => {
          success = null;
        }, 3000);
      } else {
        success = "No changes needed";
        
        messageTimeout = setTimeout(() => {
          success = null;
        }, 3000);
      }
    } catch (err) {
      error = 'Failed to sync with Linear.';
    } finally {
      loading = false;
      isSyncing = false;
    }
  }
  
  // Sync from Linear (pull updates)
  async function syncFromLinear() {
    if (!config.enabled) return;
    
    loading = true;
    isSyncing = true;
    error = null;
    
    try {
      const synced = await LinearSyncService.syncFromLinear();
      
      if (synced > 0) {
        success = `${synced} chunks updated from Linear`;
      } else {
        success = "All chunks are up to date";
      }
      
      messageTimeout = setTimeout(() => {
        success = null;
      }, 3000);
    } catch (err) {
      error = 'Failed to sync from Linear.';
    } finally {
      loading = false;
      isSyncing = false;
    }
  }
  
  // Two-way sync
  async function syncAll() {
    if (!config.enabled) return;
    
    loading = true;
    isSyncing = true;
    error = null;
    
    try {
      const result = await LinearSyncService.syncAll();
      
      if (result.toLinear > 0 || result.fromLinear > 0) {
        success = `Synced ${result.toLinear} to Linear, ${result.fromLinear} from Linear`;
      } else {
        success = "All items are in sync";
      }
      
      messageTimeout = setTimeout(() => {
        success = null;
      }, 3000);
    } catch (err) {
      error = 'Failed to sync with Linear.';
    } finally {
      loading = false;
      isSyncing = false;
    }
  }
  
  // Create Boardt project in Linear with issue structure
  async function setupBoardtProject() {
    if (!config.enabled || !config.teamId) return;
    
    loading = true;
    isSyncing = true;
    error = null;
    
    try {
      const project = await createBoardtProject();
      
      if (project) {
        success = `Created Boardt project in Linear with predefined issues`;
        
        // Show success for longer as this is a significant operation
        messageTimeout = setTimeout(() => {
          success = null;
        }, 5000);
      } else {
        error = "Failed to create Boardt project";
      }
    } catch (err) {
      error = 'Failed to create Boardt project in Linear.';
    } finally {
      loading = false;
      isSyncing = false;
    }
  }
</script>

<div class="linear-panel">
  <div class="panel-header">
    <h3>Linear Integration</h3>
    <button class="close-button" on:click={onClose} aria-label="Close">×</button>
  </div>
  
  {#if error}
    <div class="alert error">
      <span class="icon">⚠️</span>
      <span class="message">{error}</span>
    </div>
  {/if}
  
  {#if success}
    <div class="alert success">
      <span class="icon">✓</span>
      <span class="message">{success}</span>
    </div>
  {/if}
  
  {#if !config.enabled}
    <div class="alert warning">
      <span class="icon">ℹ️</span>
      <span class="message">Linear integration is disabled. Enable it in settings.</span>
    </div>
  {:else}
    <div class="status-info">
      <div class="status-row">
        <span class="status-label">Selected nodes:</span>
        <span class="status-value">{statusInfo.total}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Synced with Linear:</span>
        <span class="status-value">{statusInfo.synced} / {statusInfo.total}</span>
      </div>
      {#if lastSyncTime}
        <div class="status-row">
          <span class="status-label">Last synced:</span>
          <span class="status-value">{lastSyncTime}</span>
        </div>
      {/if}
    </div>
    
    <div class="button-group">
      <button 
        class="sync-button" 
        on:click={createLinearIssues}
        disabled={loading || !config.teamId || selectedNodes.length === 0}
      >
        {#if isSyncing}
          <div class="spinner"></div>
          Syncing...
        {:else}
          Push to Linear
        {/if}
      </button>
      
      <button 
        class="sync-button secondary" 
        on:click={syncFromLinear}
        disabled={loading || !config.teamId}
      >
        {#if isSyncing}
          <div class="spinner"></div>
          Syncing...
        {:else}
          Pull from Linear
        {/if}
      </button>
      
      <button 
        class="sync-button two-way" 
        on:click={syncAll}
        disabled={loading || !config.teamId}
      >
        {#if isSyncing}
          <div class="spinner"></div>
          Syncing...
        {:else}
          Two-way Sync
        {/if}
      </button>
      
      <button
        class="sync-button project"
        on:click={setupBoardtProject}
        disabled={loading || !config.teamId}
      >
        {#if isSyncing}
          <div class="spinner"></div>
          Setting up...
        {:else}
          Create Boardt Project
        {/if}
      </button>
    </div>
    
    <div class="help-text">
      <p>
        <strong>Push to Linear:</strong> Create or update Linear issues for selected nodes.
      </p>
      <p>
        <strong>Pull from Linear:</strong> Update nodes with changes from Linear.
      </p>
      <p>
        <strong>Two-way Sync:</strong> Synchronize both directions.
      </p>
      <p>
        <strong>Create Boardt Project:</strong> Set up a Linear project with Boardt issue structure.
      </p>
    </div>
  {/if}
</div>

<style>
  .linear-panel {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: #1c1917;
    border: 1px solid #292524;
    border-radius: 12px;
    padding: 16px;
    width: 300px;
    color: #e4e4e7;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #fafaf9;
  }
  
  .close-button {
    background: none;
    border: none;
    color: #a1a1aa;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  
  .close-button:hover {
    background: #292524;
    color: #fafaf9;
  }
  
  .alert {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }
  
  .error {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid #ef4444;
  }
  
  .success {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid #22c55e;
  }
  
  .warning {
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid #f59e0b;
  }
  
  .status-info {
    background: #292524;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }
  
  .status-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
  }
  
  .status-row:last-child {
    margin-bottom: 0;
  }
  
  .status-label {
    color: #a1a1aa;
  }
  
  .status-value {
    font-weight: 500;
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .sync-button {
    padding: 10px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .sync-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .sync-button {
    background: #3b82f6;
    color: white;
  }
  
  .sync-button:hover:not(:disabled) {
    background: #2563eb;
  }
  
  .sync-button.secondary {
    background: #4b5563;
    color: white;
  }
  
  .sync-button.secondary:hover:not(:disabled) {
    background: #6b7280;
  }
  
  .sync-button.two-way {
    background: #8b5cf6;
    color: white;
  }
  
  .sync-button.two-way:hover:not(:disabled) {
    background: #7c3aed;
  }
  
  .sync-button.project {
    background: #059669;
    color: white;
  }
  
  .sync-button.project:hover:not(:disabled) {
    background: #047857;
  }
  
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .help-text {
    font-size: 12px;
    color: #a1a1aa;
    line-height: 1.4;
  }
  
  .help-text p {
    margin: 0 0 8px 0;
  }
  
  .help-text p:last-child {
    margin-bottom: 0;
  }
  
  .help-text strong {
    color: #d1d5db;
  }
</style>