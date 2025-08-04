<!--
  PresentationView.svelte - Professional client presentation layout
  Task 9: Presentation Designer - Professional client presentation view
-->
<script>
  import { createEventDispatcher } from 'svelte';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { presentationModeStore } from '../../stores/presentationMode.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';
  import ChunkCard from './ChunkCard.svelte';
  import StoryFlowDiagram from './StoryFlowDiagram.svelte';
  import ExportControls from './ExportControls.svelte';

  const dispatch = createEventDispatcher();

  // Reactive state
  $: chunks = storyChunksStore.chunks;
  $: connections = storyChunksStore.connections;
  $: isPresenting = presentationModeStore.isPresenting;
  $: currentSlide = presentationModeStore.currentSlide;
  $: slides = presentationModeStore.slides;
  $: currentSlideData = presentationModeStore.getCurrentSlide();

  // Layout settings
  let viewMode = 'grid'; // 'grid', 'timeline', 'flow'
  let showMetadata = true;
  let showConnections = true;
  let compactView = false;

  /**
   * Start presentation mode
   */
  function startPresentation() {
    const slideData = presentationModeStore.generateSlidesFromChunks(chunks, connections);
    presentationModeStore.startPresentation(slideData);
  }

  /**
   * End presentation mode
   */
  function endPresentation() {
    presentationModeStore.endPresentation();
  }

  /**
   * Navigate slides
   */
  function nextSlide() {
    presentationModeStore.nextSlide();
  }

  function previousSlide() {
    presentationModeStore.previousSlide();
  }

  function goToSlide(index) {
    presentationModeStore.goToSlide(index);
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeydown(event) {
    if (!isPresenting) return;

    switch (event.key) {
      case 'ArrowRight':
      case ' ':
        event.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        previousSlide();
        break;
      case 'Escape':
        event.preventDefault();
        endPresentation();
        break;
      case 'f':
      case 'F11':
        event.preventDefault();
        presentationModeStore.toggleFullscreen();
        break;
    }
  }

  /**
   * Export presentation
   */
  function exportPresentation() {
    uiStore.openExportDialog();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="presentation-view" class:presenting={isPresenting} class:compact={compactView}>
  {#if !isPresenting}
    <!-- Presentation Setup Mode -->
    <div class="presentation-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Storyboard Presentation</h1>
          <p>{chunks.length} chunks • {connections.length} connections</p>
        </div>

        <div class="header-controls">
          <div class="view-toggles">
            <button
              class="toggle-btn"
              class:active={viewMode === 'grid'}
              on:click={() => viewMode = 'grid'}
              title="Grid view"
            >
              ⊞
            </button>
            <button
              class="toggle-btn"
              class:active={viewMode === 'timeline'}
              on:click={() => viewMode = 'timeline'}
              title="Timeline view"
            >
              ⏱️
            </button>
            <button
              class="toggle-btn"
              class:active={viewMode === 'flow'}
              on:click={() => viewMode = 'flow'}
              title="Flow diagram"
            >
              🌊
            </button>
          </div>

          <div class="display-options">
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showMetadata} />
              <span>Show metadata</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showConnections} />
              <span>Show connections</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={compactView} />
              <span>Compact view</span>
            </label>
          </div>

          <div class="action-buttons">
            <button class="btn secondary" on:click={exportPresentation}>
              📤 Export
            </button>
            <button class="btn primary" on:click={startPresentation} disabled={chunks.length === 0}>
              ▶️ Start Presentation
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="presentation-content">
      {#if chunks.length === 0}
        <div class="empty-state">
          <div class="empty-icon">📽️</div>
          <h3>No story chunks to present</h3>
          <p>Create some chunks in the canvas view to build your presentation</p>
          <button class="btn primary" on:click={() => uiStore.switchView('canvas')}>
            Go to Canvas
          </button>
        </div>
      {:else if viewMode === 'grid'}
        <!-- Grid Layout -->
        <div class="chunks-grid" class:compact={compactView}>
          {#each chunks as chunk, index}
            <ChunkCard
              {chunk}
              {index}
              {showMetadata}
              {showConnections}
              connections={storyChunksStore.getChunkConnections(chunk.id)}
              on:chunkSelect={(e) => storyChunksStore.selectChunk(e.detail.chunkId)}
            />
          {/each}
        </div>
      {:else if viewMode === 'timeline'}
        <!-- Timeline Layout -->
        <div class="timeline-view">
          <div class="timeline-header">
            <h3>Story Timeline</h3>
            <p>Chronological flow of your storyboard</p>
          </div>
          <div class="timeline-content">
            {#each chunks as chunk, index}
              <div class="timeline-item">
                <div class="timeline-marker">{index + 1}</div>
                <div class="timeline-card">
                  <ChunkCard
                    {chunk}
                    {index}
                    {showMetadata}
                    {showConnections}
                    connections={storyChunksStore.getChunkConnections(chunk.id)}
                    compact={true}
                  />
                </div>
                {#if index < chunks.length - 1}
                  <div class="timeline-connector"></div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {:else if viewMode === 'flow'}
        <!-- Flow Diagram -->
        <div class="flow-view">
          <StoryFlowDiagram {chunks} {connections} />
        </div>
      {/if}
    </div>
  {:else}
    <!-- Presentation Mode -->
    <div class="presentation-mode">
      <!-- Slide Content -->
      <div class="slide-container">
        {#if currentSlideData}
          {#if currentSlideData.type === 'title'}
            <div class="title-slide">
              <h1>{currentSlideData.title}</h1>
              <h2>{currentSlideData.subtitle}</h2>
              {#if currentSlideData.notes}
                <p class="slide-notes">{currentSlideData.notes}</p>
              {/if}
            </div>
          {:else if currentSlideData.type === 'overview'}
            <div class="overview-slide">
              <h1>{currentSlideData.title}</h1>
              <div class="overview-content">
                <StoryFlowDiagram chunks={currentSlideData.chunks} connections={currentSlideData.connections} compact={true} />
              </div>
            </div>
          {:else if currentSlideData.type === 'chunk'}
            <div class="chunk-slide">
              <div class="slide-header">
                <h1>{currentSlideData.title}</h1>
                <div class="slide-meta">
                  Chunk {currentSlideData.chunkIndex} of {currentSlideData.totalChunks}
                </div>
              </div>
              
              {#if currentSlideData.description}
                <p class="chunk-description">{currentSlideData.description}</p>
              {/if}

              <div class="chunk-images">
                {#each currentSlideData.images as image, index}
                  <div class="slide-image">
                    <img src={image.url} alt={image.prompt} />
                    <div class="image-caption">{image.prompt}</div>
                  </div>
                {/each}
              </div>

              {#if showConnections && currentSlideData.connections.length > 0}
                <div class="slide-connections">
                  <h3>Connections</h3>
                  <div class="connections-list">
                    {#each currentSlideData.connections as connection}
                      <div class="connection-item">
                        {connection.label || `${connection.connectionType} connection`}
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {:else if currentSlideData.type === 'summary'}
            <div class="summary-slide">
              <h1>{currentSlideData.title}</h1>
              <div class="summary-stats">
                <div class="stat-item">
                  <div class="stat-number">{currentSlideData.totalChunks}</div>
                  <div class="stat-label">Story Chunks</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{currentSlideData.totalImages}</div>
                  <div class="stat-label">Generated Images</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{currentSlideData.totalConnections}</div>
                  <div class="stat-label">Connections</div>
                </div>
              </div>
              {#if currentSlideData.notes}
                <p class="slide-notes">{currentSlideData.notes}</p>
              {/if}
            </div>
          {/if}
        {/if}
      </div>

      <!-- Presentation Controls -->
      <div class="presentation-controls">
        <div class="controls-left">
          <button class="control-btn" on:click={endPresentation} title="Exit presentation">
            ❌
          </button>
          <button class="control-btn" on:click={() => presentationModeStore.toggleFullscreen()} title="Toggle fullscreen">
            {presentationModeStore.fullscreen ? '🪟' : '⛶'}
          </button>
        </div>

        <div class="controls-center">
          <button
            class="control-btn"
            on:click={previousSlide}
            disabled={!presentationModeStore.canGoPrevious}
            title="Previous slide"
          >
            ◀️
          </button>
          
          <div class="slide-indicator">
            {currentSlide + 1} / {slides.length}
          </div>
          
          <button
            class="control-btn"
            on:click={nextSlide}
            disabled={!presentationModeStore.canGoNext}
            title="Next slide"
          >
            ▶️
          </button>
        </div>

        <div class="controls-right">
          <div class="progress-bar">
            <div class="progress-fill" style="width: {presentationModeStore.progressPercentage}%"></div>
          </div>
        </div>
      </div>

      <!-- Slide Thumbnails -->
      <div class="slide-thumbnails">
        {#each slides as slide, index}
          <button
            class="thumbnail"
            class:active={index === currentSlide}
            on:click={() => goToSlide(index)}
            title="Go to slide {index + 1}"
          >
            <div class="thumbnail-number">{index + 1}</div>
            <div class="thumbnail-title">{slide.title}</div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Export Controls Modal -->
  <ExportControls />
</div>

<style>
  .presentation-view {
    width: 100%;
    height: 100%;
    background: #f9fafb;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .presentation-view.presenting {
    background: #000;
    color: white;
  }

  .presentation-header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 20px 24px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .title-section h1 {
    margin: 0 0 4px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .title-section p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .view-toggles {
    display: flex;
    gap: 4px;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
  }

  .toggle-btn {
    background: none;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: #e5e7eb;
  }

  .toggle-btn.active {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .display-options {
    display: flex;
    gap: 16px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .btn {
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn.primary {
    background: #3b82f6;
    color: white;
  }

  .btn.primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn.secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .btn.secondary:hover {
    background: #e5e7eb;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .presentation-content {
    flex: 1;
    overflow: auto;
    padding: 24px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: #6b7280;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
  }

  .empty-state p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .chunks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .chunks-grid.compact {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .timeline-view {
    max-width: 800px;
    margin: 0 auto;
  }

  .timeline-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .timeline-header h3 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .timeline-header p {
    margin: 0;
    color: #6b7280;
  }

  .timeline-content {
    position: relative;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    position: relative;
  }

  .timeline-marker {
    width: 40px;
    height: 40px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 24px;
    flex-shrink: 0;
    z-index: 1;
  }

  .timeline-card {
    flex: 1;
  }

  .timeline-connector {
    position: absolute;
    left: 19px;
    top: 40px;
    width: 2px;
    height: 32px;
    background: #e5e7eb;
  }

  .flow-view {
    height: 600px;
  }

  /* Presentation Mode Styles */
  .presentation-mode {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .slide-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .title-slide,
  .overview-slide,
  .chunk-slide,
  .summary-slide {
    max-width: 1000px;
    width: 100%;
    text-align: center;
  }

  .title-slide h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;
  }

  .title-slide h2 {
    font-size: 1.5rem;
    font-weight: 400;
    color: #d1d5db;
    margin-bottom: 2rem;
  }

  .slide-notes {
    font-size: 1.1rem;
    color: #9ca3af;
    line-height: 1.6;
  }

  .chunk-slide .slide-header {
    margin-bottom: 2rem;
  }

  .chunk-slide h1 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: white;
  }

  .slide-meta {
    font-size: 1rem;
    color: #9ca3af;
  }

  .chunk-description {
    font-size: 1.2rem;
    color: #d1d5db;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .chunk-images {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 2rem;
  }

  .slide-image img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
  }

  .image-caption {
    margin-top: 8px;
    font-size: 0.9rem;
    color: #9ca3af;
  }

  .summary-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin: 2rem 0;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 1.1rem;
    color: #d1d5db;
  }

  .presentation-controls {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 12px;
    padding: 12px 20px;
  }

  .controls-left,
  .controls-center,
  .controls-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  .control-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .slide-indicator {
    color: white;
    font-size: 14px;
    font-weight: 500;
    min-width: 60px;
    text-align: center;
  }

  .progress-bar {
    width: 100px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }

  .slide-thumbnails {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .thumbnail {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
    text-align: left;
  }

  .thumbnail:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .thumbnail.active {
    background: rgba(59, 130, 246, 0.8);
    border-color: #3b82f6;
  }

  .thumbnail-number {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .thumbnail-title {
    font-size: 10px;
    opacity: 0.8;
    line-height: 1.2;
  }
</style>
