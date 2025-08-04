<!--
  CanvasView.svelte - Enhanced SvelteFlow canvas workspace with chunk support
  Task 7: Canvas Flow Architect - SvelteFlow canvas workspace with ChunkNode components
-->
<script>
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';
  import CanvasControls from './CanvasControls.svelte';

  // Reactive data from stores
  $: chunks = storyChunksStore.chunks;
  $: connections = storyChunksStore.connections;

  // Convert chunks to SvelteFlow nodes
  $: nodes = chunks.map(chunk => ({
    id: chunk.id,
    type: 'default',
    position: chunk.position,
    data: {
      label: chunk.title,
      chunk: chunk
    }
  }));

  // Convert connections to SvelteFlow edges
  $: edges = connections.map(connection => ({
    id: connection.id,
    source: connection.sourceChunkId,
    target: connection.targetChunkId,
    type: 'default',
    data: { connection }
  }));

  // Canvas settings
  $: showGrid = uiStore.showGrid;
  $: snapToGrid = uiStore.snapToGrid;
  $: gridSize = uiStore.gridSize;

  /**
   * Handle node drag end - update chunk position
   */
  function onNodeDragStop(event) {
    const { node } = event.detail;
    if (node.type === 'chunk') {
      storyChunksStore.updateChunk(node.id, {
        position: node.position
      });
    }
  }

  /**
   * Handle viewport change
   */
  function onViewportChange(event) {
    const { viewport } = event.detail;
    uiStore.setCanvasPosition({ x: viewport.x, y: viewport.y });
    uiStore.setCanvasZoom(viewport.zoom);
  }

  /**
   * Handle node selection
   */
  function onSelectionChange(event) {
    const { nodes: selectedNodes, edges: selectedEdges } = event.detail;
    const selectedIds = [
      ...selectedNodes.map(n => n.id),
      ...selectedEdges.map(e => e.id)
    ];
    uiStore.selectItems(selectedIds);
  }

  /**
   * Handle connection creation
   */
  function onConnect(event) {
    const { connection } = event.detail;
    
    // Create new story connection
    storyChunksStore.addConnection({
      sourceChunkId: connection.source,
      targetChunkId: connection.target,
      connectionType: 'sequence',
      label: ''
    });
  }

  /**
   * Handle canvas click - clear selection if clicking empty space
   */
  function onCanvasClick(event) {
    // Check if we clicked on empty canvas
    if (event.target.classList.contains('svelte-flow__pane')) {
      uiStore.clearSelection();
      storyChunksStore.selectChunk(null);
    }
  }

  /**
   * Handle canvas context menu
   */
  function onCanvasContextMenu(event) {
    event.preventDefault();
    
    // Only show context menu if clicking on empty canvas
    if (event.target.classList.contains('svelte-flow__pane')) {
      uiStore.showContextMenu({ x: event.clientX, y: event.clientY });
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function onKeyDown(event) {
    if (!uiStore.keyboardShortcutsEnabled) return;

    // Delete selected items
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedItems = uiStore.selectedItems;
      selectedItems.forEach(itemId => {
        // Check if it's a chunk or connection
        const chunk = storyChunksStore.getChunk(itemId);
        if (chunk) {
          storyChunksStore.removeChunk(itemId);
        } else {
          storyChunksStore.removeConnection(itemId);
        }
      });
      uiStore.clearSelection();
    }

    // Zoom shortcuts
    if (event.ctrlKey || event.metaKey) {
      if (event.key === '=' || event.key === '+') {
        event.preventDefault();
        uiStore.zoomIn();
      } else if (event.key === '-') {
        event.preventDefault();
        uiStore.zoomOut();
      } else if (event.key === '0') {
        event.preventDefault();
        uiStore.resetZoom();
      }
    }

    // Select all
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      const allIds = [...nodes.map(n => n.id), ...edges.map(e => e.id)];
      uiStore.selectItems(allIds);
    }
  }

  /**
   * Add new chunk at canvas center
   */
  function addChunkAtCenter() {
    const centerX = -uiStore.canvasPosition.x + (window.innerWidth / 2) / uiStore.canvasZoom;
    const centerY = -uiStore.canvasPosition.y + (window.innerHeight / 2) / uiStore.canvasZoom;
    
    const newChunk = storyChunksStore.addChunk({
      title: `Chunk ${storyChunksStore.chunkCount + 1}`,
      position: { x: centerX, y: centerY }
    });
    
    storyChunksStore.selectChunk(newChunk.id);
    uiStore.selectItems(newChunk.id);
  }

  // Expose function for external use
  export { addChunkAtCenter };
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="canvas-container">
  <!-- Canvas Controls -->
  <CanvasControls on:addChunk={addChunkAtCenter} />

  <!-- Canvas Placeholder -->
  <div class="canvas-placeholder">
    <div class="canvas-content">
      <h2>Canvas View</h2>
      <p>Story chunks and connections will be displayed here</p>

      {#if chunks.length > 0}
        <div class="chunks-preview">
          <h3>Chunks ({chunks.length})</h3>
          {#each chunks as chunk}
            <div class="chunk-preview" on:click={() => storyChunksStore.selectChunk(chunk.id)}>
              <strong>{chunk.title}</strong>
              <span class="chunk-type">{chunk.chunkType}</span>
              <span class="image-count">{chunk.images.length} images</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if connections.length > 0}
        <div class="connections-preview">
          <h3>Connections ({connections.length})</h3>
          {#each connections as connection}
            <div class="connection-preview">
              <span>{connection.connectionType}: {connection.label || 'Unlabeled'}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Empty state -->
  {#if nodes.length === 0}
    <div class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📽️</div>
        <h3>No story chunks yet</h3>
        <p>Create your first chunk to start building your storyboard</p>
        <button class="create-chunk-btn" on:click={addChunkAtCenter}>
          Create First Chunk
        </button>
      </div>
    </div>
  {/if}

  <!-- Context menu (to be implemented) -->
  {#if uiStore.contextMenuOpen}
    <div
      class="context-menu"
      style="left: {uiStore.contextMenuPosition.x}px; top: {uiStore.contextMenuPosition.y}px"
      on:click|stopPropagation
      on:contextmenu|preventDefault
    >
      <button on:click={addChunkAtCenter}>Add Chunk Here</button>
      <button on:click={() => uiStore.openChunkCreator()}>Create Sequence</button>
      <button on:click={() => uiStore.toggleGrid()}>Toggle Grid</button>
      <button on:click={() => uiStore.resetZoom()}>Reset Zoom</button>
    </div>
  {/if}
</div>

<style>
  .canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #18181b; /* zinc-900 */
  }

  .empty-state {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
  }

  .empty-content {
    text-align: center;
    color: #6b7280;
    pointer-events: all;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
  }

  .empty-content p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .create-chunk-btn {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .create-chunk-btn:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .context-menu {
    position: fixed;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px;
    z-index: 1000;
    min-width: 150px;
  }

  .context-menu button {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .context-menu button:hover {
    background: #f3f4f6;
  }

  /* Canvas placeholder styles */
  .canvas-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #18181b; /* zinc-900 */
  }

  .canvas-content {
    text-align: center;
    max-width: 600px;
    padding: 40px;
  }

  .canvas-content h2 {
    font-size: 2rem;
    color: #fafafa; /* zinc-50 */
    margin-bottom: 1rem;
  }

  .canvas-content p {
    color: #a1a1aa; /* zinc-400 */
    margin-bottom: 2rem;
  }

  .chunks-preview,
  .connections-preview {
    margin: 2rem 0;
    text-align: left;
  }

  .chunks-preview h3,
  .connections-preview h3 {
    font-size: 1.2rem;
    color: #fafafa; /* zinc-50 */
    margin-bottom: 1rem;
  }

  .chunk-preview {
    background: #27272a; /* zinc-800 */
    border: 1px solid #3f3f46; /* zinc-700 */
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chunk-preview:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }

  .chunk-type {
    background: #3f3f46; /* zinc-700 */
    color: #a1a1aa; /* zinc-400 */
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    text-transform: capitalize;
  }

  .image-count {
    color: #a1a1aa; /* zinc-400 */
    font-size: 12px;
  }

  .connection-preview {
    background: #27272a; /* zinc-800 */
    border: 1px solid #3f3f46; /* zinc-700 */
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 4px;
    font-size: 14px;
    color: #e4e4e7; /* zinc-200 */
  }
</style>
