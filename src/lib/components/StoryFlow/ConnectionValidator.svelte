<!--
  ConnectionValidator.svelte - Story flow validation and error detection
  Task 10: Connection Specialist - ConnectionValidator for story flow validation
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';
  import type { StoryChunk, StoryConnection } from '../../types/storyboard.js';

  const dispatch = createEventDispatcher();

  // Reactive state
  $: chunks = storyChunksStore.chunks;
  $: connections = storyChunksStore.connections;
  $: showValidator = uiStore.showConnectionValidator;
  $: validationResults = validateStoryFlow(chunks, connections);

  interface ValidationIssue {
    id: string;
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    chunkId?: string;
    connectionId?: string;
    autoFixable?: boolean;
  }

  interface ValidationResults {
    isValid: boolean;
    issues: ValidationIssue[];
    stats: {
      totalChunks: number;
      totalConnections: number;
      orphanedChunks: number;
      deadEnds: number;
      cycles: number;
    };
  }

  /**
   * Validate the entire story flow
   */
  function validateStoryFlow(chunks: StoryChunk[], connections: StoryConnection[]): ValidationResults {
    const issues: ValidationIssue[] = [];
    
    // Basic stats
    const stats = {
      totalChunks: chunks.length,
      totalConnections: connections.length,
      orphanedChunks: 0,
      deadEnds: 0,
      cycles: 0
    };

    // Check for orphaned chunks (no incoming or outgoing connections)
    chunks.forEach(chunk => {
      const hasIncoming = connections.some(conn => conn.targetChunkId === chunk.id);
      const hasOutgoing = connections.some(conn => conn.sourceChunkId === chunk.id);
      
      if (!hasIncoming && !hasOutgoing) {
        stats.orphanedChunks++;
        issues.push({
          id: `orphaned-${chunk.id}`,
          type: 'warning',
          category: 'Connectivity',
          message: `Chunk "${chunk.title}" has no connections`,
          chunkId: chunk.id,
          autoFixable: false
        });
      }
    });

    // Check for dead ends (no outgoing connections)
    chunks.forEach(chunk => {
      const hasOutgoing = connections.some(conn => conn.sourceChunkId === chunk.id);
      
      if (!hasOutgoing && chunk.chunkType !== 'keyframe') {
        stats.deadEnds++;
        issues.push({
          id: `deadend-${chunk.id}`,
          type: 'info',
          category: 'Flow',
          message: `Chunk "${chunk.title}" is a dead end (no outgoing connections)`,
          chunkId: chunk.id,
          autoFixable: false
        });
      }
    });

    // Check for broken connections
    connections.forEach(connection => {
      const sourceExists = chunks.some(chunk => chunk.id === connection.sourceChunkId);
      const targetExists = chunks.some(chunk => chunk.id === connection.targetChunkId);
      
      if (!sourceExists) {
        issues.push({
          id: `broken-source-${connection.id}`,
          type: 'error',
          category: 'Broken Links',
          message: `Connection references non-existent source chunk`,
          connectionId: connection.id,
          autoFixable: true
        });
      }
      
      if (!targetExists) {
        issues.push({
          id: `broken-target-${connection.id}`,
          type: 'error',
          category: 'Broken Links',
          message: `Connection references non-existent target chunk`,
          connectionId: connection.id,
          autoFixable: true
        });
      }
    });

    // Check for missing entry points
    const hasEntryPoint = chunks.some(chunk => {
      const hasIncoming = connections.some(conn => conn.targetChunkId === chunk.id);
      return !hasIncoming;
    });

    if (chunks.length > 0 && !hasEntryPoint) {
      issues.push({
        id: 'no-entry-point',
        type: 'warning',
        category: 'Flow',
        message: 'Story has no clear entry point (all chunks have incoming connections)',
        autoFixable: false
      });
    }

    // Check for choice chunks without multiple branches
    chunks.forEach(chunk => {
      if (chunk.chunkType === 'choice') {
        const outgoingChoices = connections.filter(conn => 
          conn.sourceChunkId === chunk.id && conn.connectionType === 'choice'
        );
        
        if (outgoingChoices.length < 2) {
          issues.push({
            id: `insufficient-choices-${chunk.id}`,
            type: 'warning',
            category: 'Branching',
            message: `Choice chunk "${chunk.title}" should have at least 2 choice branches`,
            chunkId: chunk.id,
            autoFixable: false
          });
        }
      }
    });

    // Check for cycles (simplified detection)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    function hasCycle(chunkId: string): boolean {
      if (recursionStack.has(chunkId)) {
        stats.cycles++;
        return true;
      }
      
      if (visited.has(chunkId)) {
        return false;
      }
      
      visited.add(chunkId);
      recursionStack.add(chunkId);
      
      const outgoing = connections.filter(conn => conn.sourceChunkId === chunkId);
      for (const connection of outgoing) {
        if (hasCycle(connection.targetChunkId)) {
          return true;
        }
      }
      
      recursionStack.delete(chunkId);
      return false;
    }

    chunks.forEach(chunk => {
      if (!visited.has(chunk.id)) {
        if (hasCycle(chunk.id)) {
          issues.push({
            id: `cycle-${chunk.id}`,
            type: 'info',
            category: 'Flow',
            message: `Potential cycle detected starting from "${chunk.title}"`,
            chunkId: chunk.id,
            autoFixable: false
          });
        }
      }
    });

    return {
      isValid: issues.filter(issue => issue.type === 'error').length === 0,
      issues,
      stats
    };
  }

  /**
   * Auto-fix issues where possible
   */
  function autoFixIssues() {
    const fixableIssues = validationResults.issues.filter(issue => issue.autoFixable);
    
    fixableIssues.forEach(issue => {
      if (issue.connectionId) {
        // Remove broken connections
        storyChunksStore.removeConnection(issue.connectionId);
      }
    });

    dispatch('issuesFixed', { fixedCount: fixableIssues.length });
  }

  /**
   * Navigate to problematic chunk
   */
  function navigateToChunk(chunkId: string) {
    if (chunkId) {
      storyChunksStore.selectChunk(chunkId);
      uiStore.selectItems(chunkId);
      uiStore.switchView('canvas');
      close();
    }
  }

  /**
   * Get issue icon
   */
  function getIssueIcon(type: string) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Get issue color
   */
  function getIssueColor(type: string) {
    const colors = {
      error: '#dc2626',
      warning: '#d97706',
      info: '#2563eb'
    };
    return colors[type] || colors.info;
  }

  /**
   * Group issues by category
   */
  function groupIssuesByCategory(issues: ValidationIssue[]) {
    const grouped = issues.reduce((acc, issue) => {
      if (!acc[issue.category]) {
        acc[issue.category] = [];
      }
      acc[issue.category].push(issue);
      return acc;
    }, {} as Record<string, ValidationIssue[]>);

    return Object.entries(grouped).map(([category, issues]) => ({
      category,
      issues,
      errorCount: issues.filter(i => i.type === 'error').length,
      warningCount: issues.filter(i => i.type === 'warning').length,
      infoCount: issues.filter(i => i.type === 'info').length
    }));
  }

  /**
   * Close validator
   */
  function close() {
    uiStore.closeConnectionValidator();
  }

  $: groupedIssues = groupIssuesByCategory(validationResults.issues);
  $: hasErrors = validationResults.issues.some(issue => issue.type === 'error');
  $: hasWarnings = validationResults.issues.some(issue => issue.type === 'warning');
  $: fixableCount = validationResults.issues.filter(issue => issue.autoFixable).length;
</script>

{#if showValidator}
  <div class="modal-overlay" on:click|self={close}>
    <div class="validator-dialog">
      <div class="dialog-header">
        <h2>Story Flow Validation</h2>
        <button class="close-btn" on:click={close} title="Close">×</button>
      </div>

      <div class="dialog-content">
        <!-- Validation Summary -->
        <div class="validation-summary" class:valid={validationResults.isValid} class:invalid={!validationResults.isValid}>
          <div class="summary-header">
            <div class="status-icon">
              {validationResults.isValid ? '✅' : hasErrors ? '❌' : '⚠️'}
            </div>
            <div class="status-text">
              <h3>
                {#if validationResults.isValid}
                  Story Flow is Valid
                {:else if hasErrors}
                  Story Flow has Errors
                {:else}
                  Story Flow has Warnings
                {/if}
              </h3>
              <p>
                {validationResults.issues.length} issues found across {validationResults.stats.totalChunks} chunks
              </p>
            </div>
          </div>

          <!-- Stats -->
          <div class="validation-stats">
            <div class="stat-item">
              <span class="stat-number">{validationResults.stats.totalChunks}</span>
              <span class="stat-label">Chunks</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{validationResults.stats.totalConnections}</span>
              <span class="stat-label">Connections</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{validationResults.stats.orphanedChunks}</span>
              <span class="stat-label">Orphaned</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{validationResults.stats.deadEnds}</span>
              <span class="stat-label">Dead Ends</span>
            </div>
          </div>
        </div>

        <!-- Issues List -->
        {#if validationResults.issues.length > 0}
          <div class="issues-section">
            <div class="section-header">
              <h3>Issues Found</h3>
              {#if fixableCount > 0}
                <button class="auto-fix-btn" on:click={autoFixIssues}>
                  🔧 Auto-fix {fixableCount} issues
                </button>
              {/if}
            </div>

            {#each groupedIssues as group}
              <div class="issue-group">
                <div class="group-header">
                  <h4>{group.category}</h4>
                  <div class="group-counts">
                    {#if group.errorCount > 0}
                      <span class="count error">{group.errorCount} errors</span>
                    {/if}
                    {#if group.warningCount > 0}
                      <span class="count warning">{group.warningCount} warnings</span>
                    {/if}
                    {#if group.infoCount > 0}
                      <span class="count info">{group.infoCount} info</span>
                    {/if}
                  </div>
                </div>

                <div class="issues-list">
                  {#each group.issues as issue}
                    <div class="issue-item" style="border-left-color: {getIssueColor(issue.type)}">
                      <div class="issue-icon">{getIssueIcon(issue.type)}</div>
                      <div class="issue-content">
                        <div class="issue-message">{issue.message}</div>
                        {#if issue.autoFixable}
                          <div class="issue-meta">Auto-fixable</div>
                        {/if}
                      </div>
                      {#if issue.chunkId}
                        <button
                          class="navigate-btn"
                          on:click={() => navigateToChunk(issue.chunkId)}
                          title="Navigate to chunk"
                        >
                          🎯
                        </button>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-issues">
            <div class="no-issues-icon">🎉</div>
            <h3>Perfect Story Flow!</h3>
            <p>No issues found in your storyboard structure.</p>
          </div>
        {/if}
      </div>

      <div class="dialog-footer">
        <div class="footer-info">
          <span>Last validated: {new Date().toLocaleTimeString()}</span>
        </div>
        <div class="footer-actions">
          <button class="btn secondary" on:click={close}>Close</button>
          <button class="btn primary" on:click={() => location.reload()}>
            🔄 Re-validate
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
  }

  .validator-dialog {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .validation-summary {
    border-radius: 12px;
    padding: 20px;
    border: 2px solid;
  }

  .validation-summary.valid {
    background: #f0fdf4;
    border-color: #22c55e;
  }

  .validation-summary.invalid {
    background: #fef2f2;
    border-color: #ef4444;
  }

  .summary-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .status-icon {
    font-size: 2rem;
  }

  .status-text h3 {
    margin: 0 0 4px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .status-text p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
  }

  .validation-stats {
    display: flex;
    gap: 24px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .issues-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .auto-fix-btn {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .auto-fix-btn:hover {
    background: #2563eb;
  }

  .issue-group {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .group-header {
    background: #f9fafb;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .group-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .group-counts {
    display: flex;
    gap: 8px;
  }

  .count {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
  }

  .count.error {
    background: #fee2e2;
    color: #dc2626;
  }

  .count.warning {
    background: #fef3c7;
    color: #d97706;
  }

  .count.info {
    background: #dbeafe;
    color: #2563eb;
  }

  .issues-list {
    display: flex;
    flex-direction: column;
  }

  .issue-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-left: 3px solid;
    border-bottom: 1px solid #f3f4f6;
  }

  .issue-item:last-child {
    border-bottom: none;
  }

  .issue-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .issue-content {
    flex: 1;
  }

  .issue-message {
    font-size: 14px;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .issue-meta {
    font-size: 12px;
    color: #6b7280;
    font-style: italic;
  }

  .navigate-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .navigate-btn:hover {
    background: #e5e7eb;
  }

  .no-issues {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
  }

  .no-issues-icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  .no-issues h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .no-issues p {
    margin: 0;
    font-size: 14px;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .footer-info {
    font-size: 12px;
    color: #6b7280;
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }

  .btn {
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn.secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .btn.secondary:hover {
    background: #e5e7eb;
  }

  .btn.primary {
    background: #3b82f6;
    color: white;
  }

  .btn.primary:hover {
    background: #2563eb;
  }
</style>
