import { browser } from '$app/environment';
import { linearConfig } from '$lib/stores/linearConfig.svelte.js';
import { storyChunksStore } from '$lib/stores/storyChunks.svelte.js';
import { LinearService } from './linearService';
import type { LinearIssue } from './types';

// Interval reference for auto-sync
let syncInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Service for synchronizing between Boardt chunks and Linear issues
 */
export class LinearSyncService {
  /**
   * Initialize the synchronization service
   * Sets up auto-sync if enabled
   */
  static initialize(): void {
    if (!browser) return;
    
    // Subscribe to config changes
    linearConfig.subscribe((config) => {
      // Clear existing interval if any
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
      
      // Set up new interval if auto-sync is enabled
      if (config.enabled && config.autoSync) {
        syncInterval = setInterval(() => {
          this.syncFromLinear();
        }, config.syncInterval);
      }
    });
    
    // Initial sync
    const config = linearConfig.getValue();
    if (config.enabled) {
      // Small delay to ensure stores are loaded
      setTimeout(() => {
        this.syncFromLinear();
      }, 1000);
    }
  }
  
  /**
   * Clean up the synchronization service
   */
  static cleanup(): void {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }
  
  /**
   * Create a Linear issue from a Boardt chunk
   */
  static async createIssueFromChunk(chunkId: string): Promise<string | null> {
    const config = linearConfig.getValue();
    if (!config.enabled || !config.teamId) return null;
    
    // Get the chunk
    const chunks = storyChunksStore.getValue();
    const chunk = chunks.find(c => c.id === chunkId);
    if (!chunk) return null;
    
    // Skip if already has a Linear issue ID
    if (chunk.linearIssueId) return chunk.linearIssueId;
    
    try {
      // Prepare issue data
      const issueData = {
        title: chunk.title,
        description: chunk.description || '',
        teamId: config.teamId,
        status: LinearService.mapBoardtStatusToLinear(chunk.status || 'draft'),
        projectId: config.projectId || undefined
      };
      
      // Create the issue
      const issue = await LinearService.createIssue(issueData);
      
      // Update the chunk with the Linear issue ID
      if (issue) {
        storyChunksStore.updateChunk(chunkId, {
          linearIssueId: issue.id,
          lastSyncedAt: new Date().toISOString()
        });
        
        return issue.id;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to create Linear issue:', error);
      return null;
    }
  }
  
  /**
   * Update a Linear issue from a Boardt chunk
   */
  static async updateIssueFromChunk(chunkId: string): Promise<boolean> {
    const config = linearConfig.getValue();
    if (!config.enabled) return false;
    
    // Get the chunk
    const chunks = storyChunksStore.getValue();
    const chunk = chunks.find(c => c.id === chunkId);
    if (!chunk || !chunk.linearIssueId) return false;
    
    try {
      // Prepare update data
      const updateData = {
        issueId: chunk.linearIssueId,
        title: chunk.title,
        description: chunk.description || '',
        status: LinearService.mapBoardtStatusToLinear(chunk.status || 'draft')
      };
      
      // Update the issue
      await LinearService.updateIssue(updateData);
      
      // Update the last synced timestamp
      storyChunksStore.updateChunk(chunkId, {
        lastSyncedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update Linear issue:', error);
      return false;
    }
  }
  
  /**
   * Synchronize a chunk from its Linear issue
   */
  static async syncChunkFromLinear(chunkId: string): Promise<boolean> {
    const config = linearConfig.getValue();
    if (!config.enabled) return false;
    
    // Get the chunk
    const chunks = storyChunksStore.getValue();
    const chunk = chunks.find(c => c.id === chunkId);
    if (!chunk || !chunk.linearIssueId) return false;
    
    try {
      // Get the issue from Linear
      const issue = await LinearService.getIssue(chunk.linearIssueId);
      if (!issue) return false;
      
      // Check if the issue was updated after the last sync
      const issueUpdatedAt = new Date(issue.updatedAt);
      const lastSyncedAt = chunk.lastSyncedAt ? new Date(chunk.lastSyncedAt) : new Date(0);
      
      if (issueUpdatedAt > lastSyncedAt) {
        // Update the chunk with the issue data
        storyChunksStore.updateChunk(chunkId, {
          title: issue.title,
          description: issue.description || '',
          status: LinearService.mapLinearStatusToBoardt(issue.state.name),
          lastSyncedAt: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to sync chunk from Linear:', error);
      return false;
    }
  }
  
  /**
   * Synchronize all chunks from Linear
   */
  static async syncFromLinear(): Promise<number> {
    const config = linearConfig.getValue();
    if (!config.enabled) return 0;
    
    // Get all chunks with Linear issue IDs
    const chunks = storyChunksStore.getValue();
    const chunksWithLinear = chunks.filter(chunk => chunk.linearIssueId);
    
    if (chunksWithLinear.length === 0) return 0;
    
    let syncedCount = 0;
    
    // Sync each chunk
    for (const chunk of chunksWithLinear) {
      const synced = await this.syncChunkFromLinear(chunk.id);
      if (synced) syncedCount++;
    }
    
    // Update last synced timestamp
    if (syncedCount > 0) {
      linearConfig.updateLastSyncedAt();
    }
    
    return syncedCount;
  }
  
  /**
   * Synchronize all chunks to Linear
   */
  static async syncToLinear(): Promise<number> {
    const config = linearConfig.getValue();
    if (!config.enabled || !config.teamId) return 0;
    
    // Get all chunks
    const chunks = storyChunksStore.getValue();
    
    let syncedCount = 0;
    
    // Sync each chunk
    for (const chunk of chunks) {
      if (chunk.linearIssueId) {
        // Update existing issue
        const updated = await this.updateIssueFromChunk(chunk.id);
        if (updated) syncedCount++;
      } else {
        // Create new issue
        const issueId = await this.createIssueFromChunk(chunk.id);
        if (issueId) syncedCount++;
      }
    }
    
    // Update last synced timestamp
    if (syncedCount > 0) {
      linearConfig.updateLastSyncedAt();
    }
    
    return syncedCount;
  }
  
  /**
   * Perform a full two-way synchronization
   */
  static async syncAll(): Promise<{toLinear: number, fromLinear: number}> {
    const toLinear = await this.syncToLinear();
    const fromLinear = await this.syncFromLinear();
    
    return { toLinear, fromLinear };
  }
}

// Initialize sync service if in browser
if (browser) {
  LinearSyncService.initialize();
}