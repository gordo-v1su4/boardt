<!--
  CanvasView.svelte - Chunk-based SvelteFlow Canvas with Svelte 5 + Runes
-->
<script>
  import { SvelteFlow, Controls, Background, MiniMap, BackgroundVariant } from '@xyflow/svelte';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';
  import CanvasControls from './CanvasControls.svelte';
  import ChunkNode from './ChunkNode.svelte';
  import ConnectionEdge from './ConnectionEdge.svelte';

  // Get reactive state from stores using modern Svelte 5 syntax
  let chunks = $derived(storyChunksStore.chunks);
  let connections = $derived(storyChunksStore.connections);
  let selectedChunkId = $derived(storyChunksStore.selectedChunkId);
  
  // Canvas UI state
  let showGrid = $derived(uiStore.showGrid);
  let snapToGrid = $derived(uiStore.snapToGrid);
  let gridSize = $derived(uiStore.gridSize);
  let canvasZoom = $derived(uiStore.canvasZoom);
  let canvasPosition = $derived(uiStore.canvasPosition);

  // SvelteFlow nodes and edges - reactive to chunks and connections
  let nodes = $state([]);
  let edges = $state([]);

  // Custom node types for SvelteFlow
  const nodeTypes = {
    chunk: ChunkNode
  };

  // Custom edge types for SvelteFlow  
  const edgeTypes = {
    connection: ConnectionEdge
  };

  // Update nodes when chunks change - use derived to avoid infinite loops
  let derivedNodes = $derived(() => {
    return chunks.map(chunk => ({
      id: chunk.id,
      type: 'chunk',
      position: chunk.position,
      data: {
        chunk,
        selected: selectedChunkId === chunk.id
      },
      selected: selectedChunkId === chunk.id
    }));
  });

  // Update edges when connections change - use derived to avoid infinite loops
  let derivedEdges = $derived(() => {
    return connections.map(connection => ({
      id: connection.id,
      source: connection.sourceChunkId,
      target: connection.targetChunkId,
      type: 'connection',
      data: { connection },
      animated: connection.connectionType === 'choice',
      style: getConnectionStyle(connection.connectionType)
    }));
  });

  // Sync derived values to state arrays for SvelteFlow binding
  $effect(() => {
    const currentDerivedNodes = derivedNodes();
    // Simple change detection to prevent infinite loops
    if (nodes.length !== currentDerivedNodes.length ||
        currentDerivedNodes.some((node, i) => nodes[i]?.id !== node.id)) {
      nodes.length = 0;
      nodes.push(...currentDerivedNodes);
    }
  });

  $effect(() => {
    const currentDerivedEdges = derivedEdges();
    // Simple change detection to prevent infinite loops
    if (edges.length !== currentDerivedEdges.length ||
        currentDerivedEdges.some((edge, i) => edges[i]?.id !== edge.id)) {
      edges.length = 0;
      edges.push(...currentDerivedEdges);
    }
  });

  /**
   * Get connection style based on type
   */
  function getConnectionStyle(connectionType) {
    const styles = {
      sequence: 'stroke: #3b82f6; stroke-width: 2px;',
      choice: 'stroke: #f59e0b; stroke-width: 2px; stroke-dasharray: 5,5;',
      branch: 'stroke: #10b981; stroke-width: 2px;'
    };
    return styles[connectionType] || styles.sequence;
  }

  /**
   * Handle node drag end - update chunk position
   */
  function onNodeDragStop(event) {
    if (!event?.detail?.node) {
      console.warn('onNodeDragStop: event.detail.node is undefined');
      return;
    }
    
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
    if (!event?.detail?.viewport) {
      console.warn('onViewportChange: event.detail.viewport is undefined');
      return;
    }
    
    const { viewport } = event.detail;
    uiStore.setCanvasPosition({ x: viewport.x, y: viewport.y });
    uiStore.setCanvasZoom(viewport.zoom);
  }


  /**
   * Handle node selection
   */
  function onSelectionChange(event) {
    // Add safety check for event.detail
    if (!event?.detail) {
      console.warn('onSelectionChange: event.detail is undefined');
      return;
    }
    
    const { nodes: selectedNodes = [], edges: selectedEdges = [] } = event.detail;
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
   * Handle pane click - deselect all
   */
  function onPaneClick() {
    uiStore.clearSelection();
    storyChunksStore.selectChunk(null);
  }

  /**
   * Handle pane context menu
   */
  function onPaneContextMenu(event) {
    const { clientX, clientY } = event.detail.event;
    uiStore.showContextMenu({ x: clientX, y: clientY });
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
   * Handle node click
   */
  function onNodeClick(event) {
    const { node } = event.detail;
    storyChunksStore.selectChunk(node.id);
    uiStore.selectItems([node.id]);
  }

  /**
   * Add new chunk at canvas center
   */
  function addChunkAtCenter() {
    const centerX = -uiStore.canvasPosition.x + (window.innerWidth / 2) / uiStore.canvasZoom;
    const centerY = -uiStore.canvasPosition.y + (window.innerHeight / 2) / uiStore.canvasZoom;

    const newChunk = storyChunksStore.addChunk({
      title: `Chunk ${storyChunksStore.chunkCount() + 1}`,
      position: { x: centerX, y: centerY }
    });

    storyChunksStore.selectChunk(newChunk.id);
    uiStore.selectItems([newChunk.id]);
  }

  /**
   * Create sample data for testing
   */
  function createSampleData() {
    // Clear existing data
    storyChunksStore.clear();

    // Create sample chunks
    const chunk1 = storyChunksStore.addChunk({
      title: 'Opening Scene',
      description: 'Hero discovers the mysterious artifact',
      chunkType: 'sequence',
      position: { x: 100, y: 100 }
    });

    const chunk2 = storyChunksStore.addChunk({
      title: 'The Choice',
      description: 'Hero must decide: investigate or flee?',
      chunkType: 'choice',
      position: { x: 400, y: 100 }
    });

    const chunk3 = storyChunksStore.addChunk({
      title: 'Investigation Path',
      description: 'Hero explores the ancient ruins',
      chunkType: 'sequence',
      position: { x: 300, y: 300 }
    });

    const chunk4 = storyChunksStore.addChunk({
      title: 'Escape Path',
      description: 'Hero flees but is pursued',
      chunkType: 'sequence',
      position: { x: 500, y: 300 }
    });

    // Create connections
    storyChunksStore.addConnection({
      sourceChunkId: chunk1.id,
      targetChunkId: chunk2.id,
      connectionType: 'sequence',
      label: 'Continues to'
    });

    storyChunksStore.addConnection({
      sourceChunkId: chunk2.id,
      targetChunkId: chunk3.id,
      connectionType: 'choice',
      label: 'Investigate'
    });

    storyChunksStore.addConnection({
      sourceChunkId: chunk2.id,
      targetChunkId: chunk4.id,
      connectionType: 'choice',
      label: 'Escape'
    });
  }
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="canvas-container">
  <!-- Canvas Controls -->
  <CanvasControls onaddchunk={addChunkAtCenter} oncreatesampledata={createSampleData} />

  <!-- SvelteFlow Canvas -->
  <div class="canvas-wrapper">
    <!-- Debug Info -->
    <div class="debug-info">
      <p>Nodes: {nodes.length} | Edges: {edges.length} | Chunks: {chunks.length}</p>
      <button onclick={createSampleData}>Create Sample Data</button>
    </div>

    <SvelteFlow
      bind:nodes
      bind:edges
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      snapGrid={[gridSize, gridSize]}
      onnodeclick={onNodeClick}
      onnodedragstop={onNodeDragStop}
      onselectionchange={onSelectionChange}
      onconnect={onConnect}
      onpaneclick={onPaneClick}
      onpanecontextmenu={onPaneContextMenu}
    >
      <!-- Background -->
      <Background
        variant={showGrid ? BackgroundVariant.Dots : BackgroundVariant.Lines}
        gap={gridSize}
        size={1}
      />

      <!-- Controls -->
      <Controls
        showZoom={true}
        showFitView={true}
      />

      <!-- MiniMap -->
      <MiniMap
        nodeColor="#3b82f6"
        maskColor="rgba(0, 0, 0, 0.2)"
        position="bottom-right"
      />
    </SvelteFlow>
  </div>

  <!-- Empty state -->
  {#if nodes.length === 0}
    <div class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📽️</div>
        <h3>No story chunks yet</h3>
        <p>Create your first chunk to start building your storyboard</p>
        <button class="create-chunk-btn" onclick={addChunkAtCenter}>
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
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          uiStore.closeContextMenu();
        }
      }}
      oncontextmenu={(e) => e.preventDefault()}
      role="menu"
      tabindex="0"
    >
      <button onclick={addChunkAtCenter}>Add Chunk Here</button>
      <button onclick={() => uiStore.openChunkCreator()}>Create Sequence</button>
      <button onclick={() => uiStore.toggleGrid()}>Toggle Grid</button>
      <button onclick={() => uiStore.resetZoom()}>Reset Zoom</button>
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

  /* Canvas wrapper styles */
  .canvas-wrapper {
    width: 100%;
    height: 100%;
    background: #18181b; /* zinc-900 */
    position: relative;
  }

  /* Debug info styles */
  .debug-info {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 4px;
    z-index: 1000;
    font-size: 12px;
  }

  .debug-info button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    margin-left: 10px;
    cursor: pointer;
  }



  /* SvelteFlow theme overrides */
  :global(.svelte-flow) {
    background: #18181b !important;
  }

  :global(.svelte-flow__background) {
    background: #18181b !important;
  }

  :global(.svelte-flow__controls) {
    background: rgba(39, 39, 42, 0.9) !important;
    border: 1px solid #52525b !important;
    border-radius: 8px !important;
  }

  :global(.svelte-flow__controls button) {
    background: transparent !important;
    border: none !important;
    color: #e4e4e7 !important;
  }

  :global(.svelte-flow__controls button:hover) {
    background: #52525b !important;
  }

  :global(.svelte-flow__minimap) {
    background: rgba(39, 39, 42, 0.9) !important;
    border: 1px solid #52525b !important;
    border-radius: 8px !important;
  }
</style>
