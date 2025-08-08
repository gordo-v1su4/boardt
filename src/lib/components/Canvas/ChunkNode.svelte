<!--
  ChunkNode.svelte - Custom SvelteFlow node for story chunks with Svelte 5 + Runes
  Task 7: Canvas Flow Architect - ChunkNode components for story sequences
-->
<script>
  import { Handle, Position } from '@xyflow/svelte';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';

  // Props from SvelteFlow - modern Svelte 5 syntax
  let { id, data, selected = false, dragging = false } = $props();

  // Extract chunk data using derived state
  let chunk = $derived(data.chunk);
  let isSelected = $derived(selected || uiStore.isSelected(id));
  let chunkTypeColor = $derived(getChunkTypeColor(chunk?.chunkType));
  let hasImages = $derived(chunk?.images && chunk.images.length > 0);
  let imageCount = $derived(chunk?.images?.length || 0);
  let connectionCount = $derived(storyChunksStore.getChunkConnections(id).length);

  /**
   * Get color based on chunk type
   */
  function getChunkTypeColor(type) {
    const colors = {
      sequence: '#3b82f6', // blue
      choice: '#f59e0b',   // amber
      keyframe: '#10b981'  // emerald
    };
    return colors[type] || colors.sequence;
  }

  /**
   * Handle chunk selection
   */
  function handleSelect() {
    storyChunksStore.selectChunk(id);
    uiStore.selectItems(id);
  }

  /**
   * Handle double-click to edit
   */
  function handleDoubleClick() {
    // Open chunk editor (to be implemented)
    console.log('Edit chunk:', id);
  }

  /**
   * Handle context menu
   */
  function handleContextMenu(event) {
    event.preventDefault();
    uiStore.showContextMenu({ x: event.clientX, y: event.clientY });
    uiStore.selectItems(id);
  }

  /**
   * Get chunk type icon
   */
  function getChunkTypeIcon(type) {
    const icons = {
      sequence: '📽️',
      choice: '🔀',
      keyframe: '🎯'
    };
    return icons[type] || icons.sequence;
  }

  /**
   * Truncate text to fit in node
   */
  function truncateText(text, maxLength = 30) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }
</script>

<!-- Input handles for connections -->
<Handle type="target" position={Position.Top} id="top" />
<Handle type="target" position={Position.Left} id="left" />

<!-- Main chunk node -->
<div
  class="chunk-node"
  class:selected={isSelected}
  class:dragging
  style="--chunk-color: {chunkTypeColor}"
  onclick={handleSelect}
  ondblclick={handleDoubleClick}
  oncontextmenu={handleContextMenu}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); } }}
  role="button"
  tabindex="0"
>
  <!-- Header -->
  <div class="chunk-header">
    <div class="chunk-type">
      <span class="chunk-icon">{getChunkTypeIcon(chunk?.chunkType)}</span>
      <span class="chunk-type-label">{chunk?.chunkType || 'sequence'}</span>
    </div>
    <div class="chunk-stats">
      <span class="image-count" title="Images">{imageCount}📷</span>
      <span class="connection-count" title="Connections">{connectionCount}🔗</span>
    </div>
  </div>

  <!-- Title -->
  <div class="chunk-title">
    {truncateText(chunk?.title || 'Untitled Chunk', 25)}
  </div>

  <!-- Description -->
  {#if chunk?.description}
    <div class="chunk-description">
      {truncateText(chunk.description, 50)}
    </div>
  {/if}

  <!-- Image preview -->
  {#if hasImages}
    <div class="image-preview">
      {#each chunk.images.slice(0, 3) as image, index}
        <div class="preview-image" style="z-index: {3 - index}">
          <img src={image.url} alt={image.prompt} loading="lazy" />
        </div>
      {/each}
      {#if imageCount > 3}
        <div class="more-images">+{imageCount - 3}</div>
      {/if}
    </div>
  {:else}
    <div class="no-images">
      <span>No images</span>
      <button class="add-image-btn" onclick={(e) => { e.stopPropagation(); console.log('Add image to chunk'); }}>
        + Add
      </button>
    </div>
  {/if}

  <!-- Footer with metadata -->
  <div class="chunk-footer">
    <div class="chunk-id">{id.slice(0, 8)}</div>
    <div class="chunk-timestamp">
      {chunk?.updatedAt ? new Date(chunk.updatedAt).toLocaleDateString() : ''}
    </div>
  </div>
</div>

<!-- Output handles for connections -->
<Handle type="source" position={Position.Bottom} id="bottom" />
<Handle type="source" position={Position.Right} id="right" />

<style>
  .chunk-node {
    background: white;
    border: 2px solid var(--chunk-color, #3b82f6);
    border-radius: 12px;
    padding: 12px;
    min-width: 200px;
    max-width: 250px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .chunk-node:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .chunk-node.selected {
    border-color: #1d4ed8;
    box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.2);
  }

  .chunk-node.dragging {
    opacity: 0.8;
    transform: rotate(2deg);
  }

  .chunk-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .chunk-type {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--chunk-color);
    font-weight: 600;
  }

  .chunk-icon {
    font-size: 14px;
  }

  .chunk-type-label {
    text-transform: capitalize;
  }

  .chunk-stats {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: #6b7280;
  }

  .image-count,
  .connection-count {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .chunk-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .chunk-description {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 10px;
    line-height: 1.4;
  }

  .image-preview {
    position: relative;
    height: 60px;
    margin-bottom: 8px;
    display: flex;
    gap: 4px;
    overflow: hidden;
  }

  .preview-image {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }

  .preview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .more-images {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
  }

  .no-images {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60px;
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 6px;
    margin-bottom: 8px;
    gap: 4px;
  }

  .no-images span {
    font-size: 12px;
    color: #9ca3af;
  }

  .add-image-btn {
    background: var(--chunk-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 10px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .add-image-btn:hover {
    opacity: 0.8;
  }

  .chunk-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #9ca3af;
    border-top: 1px solid #f3f4f6;
    padding-top: 6px;
  }

  .chunk-id {
    font-family: monospace;
  }

  /* Handle styles */
  :global(.svelte-flow__handle) {
    width: 8px;
    height: 8px;
    background: var(--chunk-color, #3b82f6);
    border: 2px solid white;
  }

  :global(.svelte-flow__handle:hover) {
    width: 10px;
    height: 10px;
  }
</style>
