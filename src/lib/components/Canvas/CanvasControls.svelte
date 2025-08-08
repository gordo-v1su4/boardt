<!--
  CanvasControls.svelte - Toolbar controls for the canvas
  Task 7: Canvas Flow Architect - Canvas controls for chunk management
-->
<script lang="ts">
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';

  // Props for Svelte 5
  interface Props {
    onaddchunk?: () => void;
    oncreatesampledata?: () => void;
  }

  let { onaddchunk, oncreatesampledata }: Props = $props();

  // Reactive state using Svelte 5 Runes
  let chunkCount = $derived(storyChunksStore.chunkCount);
  let connectionCount = $derived(storyChunksStore.connectionCount);
  let selectedItems = $derived(uiStore.selectedItems);
  let hasSelection = $derived(uiStore.hasSelection);
  let canZoomIn = $derived(uiStore.canZoomIn);
  let canZoomOut = $derived(uiStore.canZoomOut);
  let showGrid = $derived(uiStore.showGrid);
  let snapToGrid = $derived(uiStore.snapToGrid);

  /**
   * Add new chunk
   */
  function addChunk() {
    onaddchunk?.();
  }

  /**
   * Create sample data
   */
  function createSampleData() {
    oncreatesampledata?.();
  }

  /**
   * Delete selected items
   */
  function deleteSelected() {
    if (!hasSelection) return;
    
    selectedItems.forEach(itemId => {
      const chunk = storyChunksStore.getChunk(itemId);
      if (chunk) {
        storyChunksStore.removeChunk(itemId);
      } else {
        storyChunksStore.removeConnection(itemId);
      }
    });
    
    uiStore.clearSelection();
  }

  /**
   * Clear all chunks and connections
   */
  function clearAll() {
    if (confirm('Are you sure you want to clear all chunks and connections? This cannot be undone.')) {
      storyChunksStore.clear();
      uiStore.clearSelection();
    }
  }

  /**
   * Validate story connections
   */
  function validateConnections() {
    uiStore.openConnectionValidator();
  }

  /**
   * Export canvas as image (placeholder)
   */
  function exportCanvas() {
    // This would implement canvas export functionality
    console.log('Export canvas functionality to be implemented');
  }
</script>

<div class="canvas-controls">
  <!-- Left section - Creation tools -->
  <div class="controls-section">
    <button
      class="control-btn primary"
      onclick={addChunk}
      title="Add new chunk"
    >
      <span class="btn-icon">➕</span>
      <span class="btn-text">Add Chunk</span>
    </button>

    <button
      class="control-btn"
      onclick={() => uiStore.openChunkCreator()}
      title="Create story sequence"
    >
      <span class="btn-icon">📽️</span>
      <span class="btn-text">Create Sequence</span>
    </button>

    <button
      class="control-btn"
      onclick={() => uiStore.openKeyframeInserter()}
      title="Insert keyframe"
    >
      <span class="btn-icon">🎯</span>
      <span class="btn-text">Add Keyframe</span>
    </button>

    <button
      class="control-btn secondary"
      onclick={createSampleData}
      title="Create sample story data"
    >
      <span class="btn-icon">🎬</span>
      <span class="btn-text">Sample Data</span>
    </button>
  </div>

  <!-- Center section - View controls -->
  <div class="controls-section">
    <div class="zoom-controls">
      <button
        class="control-btn small"
        class:disabled={!canZoomOut}
        onclick={() => uiStore.zoomOut()}
        disabled={!canZoomOut}
        title="Zoom out"
      >
        <span class="btn-icon">🔍-</span>
      </button>

      <span class="zoom-level">{Math.round(uiStore.canvasZoom * 100)}%</span>

      <button
        class="control-btn small"
        class:disabled={!canZoomIn}
        onclick={() => uiStore.zoomIn()}
        disabled={!canZoomIn}
        title="Zoom in"
      >
        <span class="btn-icon">🔍+</span>
      </button>

      <button
        class="control-btn small"
        onclick={() => uiStore.resetZoom()}
        title="Reset zoom to 100%"
      >
        <span class="btn-icon">🎯</span>
      </button>
    </div>

    <div class="view-toggles">
      <button
        class="control-btn toggle"
        class:active={showGrid}
        onclick={() => uiStore.toggleGrid()}
        title="Toggle grid"
      >
        <span class="btn-icon">⊞</span>
      </button>

      <button
        class="control-btn toggle"
        class:active={snapToGrid}
        onclick={() => uiStore.toggleSnapToGrid()}
        title="Toggle snap to grid"
      >
        <span class="btn-icon">🧲</span>
      </button>
    </div>
  </div>

  <!-- Right section - Actions and info -->
  <div class="controls-section">
    <div class="stats">
      <span class="stat-item">
        <span class="stat-icon">📦</span>
        <span class="stat-value">{chunkCount}</span>
        <span class="stat-label">chunks</span>
      </span>
      
      <span class="stat-item">
        <span class="stat-icon">🔗</span>
        <span class="stat-value">{connectionCount}</span>
        <span class="stat-label">connections</span>
      </span>
      
      {#if hasSelection}
        <span class="stat-item selected">
          <span class="stat-icon">✓</span>
          <span class="stat-value">{selectedItems.length}</span>
          <span class="stat-label">selected</span>
        </span>
      {/if}
    </div>

    <div class="action-buttons">
      {#if hasSelection}
        <button
          class="control-btn danger small"
          onclick={deleteSelected}
          title="Delete selected items"
        >
          <span class="btn-icon">🗑️</span>
        </button>
      {/if}

      <button
        class="control-btn"
        onclick={validateConnections}
        title="Validate story connections"
      >
        <span class="btn-icon">✅</span>
      </button>

      <button
        class="control-btn"
        onclick={exportCanvas}
        title="Export canvas"
      >
        <span class="btn-icon">📤</span>
      </button>

      <button
        class="control-btn danger"
        onclick={clearAll}
        title="Clear all"
      >
        <span class="btn-icon">🗑️</span>
        <span class="btn-text">Clear All</span>
      </button>
    </div>
  </div>
</div>

<style>
  .canvas-controls {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #27272a; /* zinc-800 */
    border: 1px solid #3f3f46; /* zinc-700 */
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .controls-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #3f3f46; /* zinc-700 */
    border: 1px solid #52525b; /* zinc-600 */
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #e4e4e7; /* zinc-200 */
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .control-btn:hover:not(.disabled) {
    background: #52525b; /* zinc-600 */
    border-color: #71717a; /* zinc-500 */
    transform: translateY(-1px);
  }

  .control-btn.primary {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .control-btn.primary:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  .control-btn.danger {
    background: #450a0a; /* red-950 */
    border-color: #7f1d1d; /* red-900 */
    color: #fca5a5; /* red-300 */
  }

  .control-btn.danger:hover {
    background: #7f1d1d; /* red-900 */
    border-color: #991b1b; /* red-800 */
  }

  .control-btn.small {
    padding: 6px 8px;
    font-size: 12px;
  }

  .control-btn.toggle.active {
    background: #1e3a8a; /* blue-900 */
    border-color: #3b82f6; /* blue-500 */
    color: #93c5fd; /* blue-300 */
  }

  .control-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 16px;
    line-height: 1;
  }

  .btn-text {
    font-size: 14px;
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #18181b; /* zinc-900 */
    border: 1px solid #3f3f46; /* zinc-700 */
    border-radius: 8px;
    padding: 4px;
  }

  .zoom-level {
    font-size: 12px;
    font-weight: 600;
    color: #a1a1aa; /* zinc-400 */
    min-width: 40px;
    text-align: center;
  }

  .view-toggles {
    display: flex;
    gap: 4px;
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 12px;
    border-left: 1px solid #3f3f46; /* zinc-700 */
    border-right: 1px solid #3f3f46; /* zinc-700 */
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #a1a1aa; /* zinc-400 */
  }

  .stat-item.selected {
    color: #3b82f6;
    font-weight: 600;
  }

  .stat-icon {
    font-size: 14px;
  }

  .stat-value {
    font-weight: 600;
    color: #374151;
  }

  .stat-item.selected .stat-value {
    color: #3b82f6;
  }

  .stat-label {
    font-size: 11px;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .canvas-controls {
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }

    .controls-section {
      width: 100%;
      justify-content: center;
    }

    .btn-text {
      display: none;
    }

    .stats {
      border: none;
      padding: 0;
    }
  }

  @media (max-width: 480px) {
    .canvas-controls {
      left: 8px;
      right: 8px;
      top: 8px;
    }

    .control-btn {
      padding: 6px 8px;
    }

    .stats {
      gap: 8px;
    }
  }
</style>
