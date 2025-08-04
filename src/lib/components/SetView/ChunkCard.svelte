<!--
  ChunkCard.svelte - Chunk representation in presentation deck format
  Task 9: Presentation Designer - ChunkCard for chunk representation in deck
-->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let chunk;
  export let index;
  export let showMetadata = true;
  export let showConnections = true;
  export let connections = [];
  export let compact = false;

  $: chunkTypeColor = getChunkTypeColor(chunk.chunkType);
  $: hasImages = chunk.images && chunk.images.length > 0;
  $: imageCount = chunk.images?.length || 0;

  /**
   * Get color based on chunk type
   */
  function getChunkTypeColor(type) {
    const colors = {
      sequence: '#3b82f6',
      choice: '#f59e0b',
      keyframe: '#10b981'
    };
    return colors[type] || colors.sequence;
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
   * Handle chunk selection
   */
  function handleSelect() {
    dispatch('chunkSelect', { chunkId: chunk.id });
  }

  /**
   * Format date
   */
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }

  /**
   * Get connection summary
   */
  function getConnectionSummary() {
    const incoming = connections.filter(c => c.targetChunkId === chunk.id).length;
    const outgoing = connections.filter(c => c.sourceChunkId === chunk.id).length;
    return { incoming, outgoing, total: incoming + outgoing };
  }

  $: connectionSummary = getConnectionSummary();
</script>

<div
  class="chunk-card"
  class:compact
  style="--chunk-color: {chunkTypeColor}"
  on:click={handleSelect}
  role="button"
  tabindex="0"
>
  <!-- Card Header -->
  <div class="card-header">
    <div class="chunk-info">
      <div class="chunk-number">{index + 1}</div>
      <div class="chunk-type">
        <span class="type-icon">{getChunkTypeIcon(chunk.chunkType)}</span>
        <span class="type-label">{chunk.chunkType}</span>
      </div>
    </div>
    
    {#if showMetadata && !compact}
      <div class="card-meta">
        <span class="image-count" title="Images">{imageCount} 📷</span>
        {#if showConnections}
          <span class="connection-count" title="Connections">{connectionSummary.total} 🔗</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Card Title -->
  <div class="card-title">
    <h3>{chunk.title}</h3>
    {#if chunk.description && !compact}
      <p class="chunk-description">{chunk.description}</p>
    {/if}
  </div>

  <!-- Images Section -->
  {#if hasImages}
    <div class="images-section" class:compact>
      {#if compact}
        <!-- Compact view - show first image only -->
        <div class="image-preview compact">
          <img src={chunk.images[0].url} alt={chunk.images[0].prompt} />
          {#if imageCount > 1}
            <div class="image-overlay">+{imageCount - 1}</div>
          {/if}
        </div>
      {:else}
        <!-- Full view - show all images in grid -->
        <div class="images-grid">
          {#each chunk.images.slice(0, 4) as image, imgIndex}
            <div class="image-item">
              <img src={image.url} alt={image.prompt} />
              {#if imgIndex === 3 && imageCount > 4}
                <div class="more-images">+{imageCount - 4}</div>
              {/if}
            </div>
          {/each}
        </div>
        
        {#if chunk.images.length > 0}
          <div class="image-caption">
            {chunk.images[0].prompt.slice(0, 100)}{chunk.images[0].prompt.length > 100 ? '...' : ''}
          </div>
        {/if}
      {/if}
    </div>
  {:else}
    <div class="no-images" class:compact>
      <div class="no-images-icon">🖼️</div>
      <span>No images</span>
    </div>
  {/if}

  <!-- Connections Section -->
  {#if showConnections && !compact && connectionSummary.total > 0}
    <div class="connections-section">
      <div class="connections-header">
        <span class="connections-title">Connections</span>
        <span class="connections-count">{connectionSummary.total}</span>
      </div>
      
      <div class="connections-summary">
        {#if connectionSummary.incoming > 0}
          <div class="connection-type">
            <span class="connection-icon">⬅️</span>
            <span>{connectionSummary.incoming} incoming</span>
          </div>
        {/if}
        {#if connectionSummary.outgoing > 0}
          <div class="connection-type">
            <span class="connection-icon">➡️</span>
            <span>{connectionSummary.outgoing} outgoing</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Metadata Footer -->
  {#if showMetadata && !compact}
    <div class="card-footer">
      <div class="metadata-item">
        <span class="metadata-label">Created:</span>
        <span class="metadata-value">{formatDate(chunk.createdAt)}</span>
      </div>
      {#if chunk.updatedAt !== chunk.createdAt}
        <div class="metadata-item">
          <span class="metadata-label">Updated:</span>
          <span class="metadata-value">{formatDate(chunk.updatedAt)}</span>
        </div>
      {/if}
      <div class="metadata-item">
        <span class="metadata-label">ID:</span>
        <span class="metadata-value">{chunk.id.slice(0, 8)}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .chunk-card {
    background: white;
    border: 2px solid var(--chunk-color);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .chunk-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .chunk-card.compact {
    padding: 12px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .chunk-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chunk-number {
    background: var(--chunk-color);
    color: white;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }

  .chunk-type {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--chunk-color);
    font-size: 12px;
    font-weight: 600;
  }

  .type-icon {
    font-size: 16px;
  }

  .type-label {
    text-transform: capitalize;
  }

  .card-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #6b7280;
  }

  .image-count,
  .connection-count {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .card-title {
    margin-bottom: 16px;
  }

  .card-title h3 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.3;
  }

  .chunk-description {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
  }

  .images-section {
    margin-bottom: 16px;
  }

  .images-section.compact {
    margin-bottom: 8px;
  }

  .image-preview.compact {
    position: relative;
    width: 100%;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
  }

  .image-preview.compact img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  .images-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }

  .image-item {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: 6px;
    overflow: hidden;
    background: #f3f4f6;
  }

  .image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .more-images {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  .image-caption {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.3;
  }

  .no-images {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 120px;
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 8px;
    color: #9ca3af;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .no-images.compact {
    height: 80px;
    margin-bottom: 8px;
  }

  .no-images-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .connections-section {
    margin-bottom: 16px;
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .connections-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .connections-title {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .connections-count {
    background: var(--chunk-color);
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
  }

  .connections-summary {
    display: flex;
    gap: 12px;
  }

  .connection-type {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #6b7280;
  }

  .connection-icon {
    font-size: 12px;
  }

  .card-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6;
    font-size: 11px;
  }

  .metadata-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .metadata-label {
    color: #9ca3af;
    font-weight: 500;
  }

  .metadata-value {
    color: #6b7280;
    font-family: monospace;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .chunk-card {
      padding: 12px;
    }

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .card-meta {
      align-self: flex-end;
    }

    .images-grid {
      grid-template-columns: 1fr;
    }

    .connections-summary {
      flex-direction: column;
      gap: 4px;
    }

    .card-footer {
      flex-direction: column;
      gap: 4px;
    }
  }
</style>
