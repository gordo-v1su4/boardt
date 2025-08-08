<!--
  KeyframeInserter.svelte - Insert keyframes between existing chunks
  Task 8: Story Sequence Manager - KeyframeInserter for adding frames between chunks
-->
<script>
  import { createEventDispatcher } from 'svelte';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { imageGenerationStore } from '../../stores/imageGeneration.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';

  const dispatch = createEventDispatcher();

  // Component state
  let selectedSourceChunk = null;
  let selectedTargetChunk = null;
  let keyframeTitle = '';
  let keyframePrompt = '';
  let transitionType = 'smooth'; // 'smooth', 'cut', 'fade'
  let isGenerating = false;
  let generatedImage = null;

  // Reactive state
  $: chunks = storyChunksStore.chunks;
  $: connections = storyChunksStore.connections;
  $: canInsert = selectedSourceChunk && selectedTargetChunk && keyframeTitle.trim() && keyframePrompt.trim();
  $: existingConnection = selectedSourceChunk && selectedTargetChunk ? 
    connections.find(c => c.sourceChunkId === selectedSourceChunk.id && c.targetChunkId === selectedTargetChunk.id) : null;

  /**
   * Get available target chunks for selected source
   */
  function getAvailableTargets(sourceChunk) {
    if (!sourceChunk) return [];
    
    const connectedChunkIds = connections
      .filter(c => c.sourceChunkId === sourceChunk.id)
      .map(c => c.targetChunkId);
    
    return chunks.filter(chunk => 
      chunk.id !== sourceChunk.id && connectedChunkIds.includes(chunk.id)
    );
  }

  /**
   * Generate keyframe image
   */
  async function generateKeyframe() {
    if (!keyframePrompt.trim()) return;

    isGenerating = true;
    generatedImage = null;

    try {
      const image = await imageGenerationStore.generateImage(keyframePrompt);
      if (image) {
        generatedImage = image;
      }
    } catch (error) {
      console.error('Keyframe generation failed:', error);
    } finally {
      isGenerating = false;
    }
  }

  /**
   * Insert keyframe between chunks
   */
  function insertKeyframe() {
    if (!canInsert || !generatedImage) return;

    // Calculate position between source and target chunks
    const sourcePos = selectedSourceChunk.position;
    const targetPos = selectedTargetChunk.position;
    const keyframePos = {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2
    };

    // Create keyframe chunk
    const keyframeChunk = storyChunksStore.addChunk({
      title: keyframeTitle.trim(),
      description: `Keyframe between "${selectedSourceChunk.title}" and "${selectedTargetChunk.title}"`,
      chunkType: 'keyframe',
      images: [generatedImage],
      position: keyframePos,
      metadata: {
        transitionType,
        sourceChunkId: selectedSourceChunk.id,
        targetChunkId: selectedTargetChunk.id
      }
    });

    // Remove existing connection
    if (existingConnection) {
      storyChunksStore.removeConnection(existingConnection.id);
    }

    // Create new connections through keyframe
    storyChunksStore.addConnection({
      sourceChunkId: selectedSourceChunk.id,
      targetChunkId: keyframeChunk.id,
      connectionType: 'sequence',
      label: `to keyframe`
    });

    storyChunksStore.addConnection({
      sourceChunkId: keyframeChunk.id,
      targetChunkId: selectedTargetChunk.id,
      connectionType: 'sequence',
      label: `from keyframe`
    });

    // Select the new keyframe
    storyChunksStore.selectChunk(keyframeChunk.id);
    uiStore.selectItems(keyframeChunk.id);

    // Close the inserter
    close();

    dispatch('keyframeInserted', { keyframe: keyframeChunk });
  }

  /**
   * Close the inserter
   */
  function close() {
    uiStore.closeKeyframeInserter();
    reset();
  }

  /**
   * Reset form
   */
  function reset() {
    selectedSourceChunk = null;
    selectedTargetChunk = null;
    keyframeTitle = '';
    keyframePrompt = '';
    transitionType = 'smooth';
    isGenerating = false;
    generatedImage = null;
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      if (generatedImage) {
        insertKeyframe();
      } else if (canInsert) {
        generateKeyframe();
      }
    }
  }

  /**
   * Auto-generate keyframe title based on chunks
   */
  function generateKeyframeTitle() {
    if (selectedSourceChunk && selectedTargetChunk) {
      keyframeTitle = `Transition: ${selectedSourceChunk.title} → ${selectedTargetChunk.title}`;
    }
  }

  /**
   * Generate transition prompt based on chunks
   */
  function generateTransitionPrompt() {
    if (selectedSourceChunk && selectedTargetChunk) {
      const sourceImages = selectedSourceChunk.images;
      const targetImages = selectedTargetChunk.images;
      
      if (sourceImages.length > 0 && targetImages.length > 0) {
        const sourcePrompt = sourceImages[sourceImages.length - 1].prompt;
        const targetPrompt = targetImages[0].prompt;
        
        keyframePrompt = `Transition scene between "${sourcePrompt}" and "${targetPrompt}", showing the progression from one to the other`;
      }
    }
  }

  // Auto-generate title and prompt when chunks are selected
  $: if (selectedSourceChunk && selectedTargetChunk && !keyframeTitle) {
    generateKeyframeTitle();
  }

  $: if (selectedSourceChunk && selectedTargetChunk && !keyframePrompt) {
    generateTransitionPrompt();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if uiStore.showKeyframeInserter}
  <div
    class="modal-overlay"
    onclick={(e) => { if (e.target === e.currentTarget) close(); }}
    onkeydown={(e) => { if (e.key === 'Escape') close(); }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="keyframe-inserter">
      <div class="inserter-header">
        <h2>Insert Keyframe</h2>
        <button class="close-btn" onclick={close} title="Close">×</button>
      </div>

      <div class="inserter-content">
        <!-- Chunk selection -->
        <div class="form-section">
          <h3>Select Connection</h3>
          
          <div class="chunk-selection">
            <div class="form-group">
              <label for="source-chunk">From Chunk</label>
              <select id="source-chunk" bind:value={selectedSourceChunk}>
                <option value={null}>Select source chunk...</option>
                {#each chunks as chunk}
                  <option value={chunk}>{chunk.title}</option>
                {/each}
              </select>
            </div>

            <div class="arrow">→</div>

            <div class="form-group">
              <label for="target-chunk">To Chunk</label>
              <select id="target-chunk" bind:value={selectedTargetChunk} disabled={!selectedSourceChunk}>
                <option value={null}>Select target chunk...</option>
                {#each getAvailableTargets(selectedSourceChunk) as chunk}
                  <option value={chunk}>{chunk.title}</option>
                {/each}
              </select>
            </div>
          </div>

          {#if existingConnection}
            <div class="connection-info">
              <span class="info-icon">ℹ️</span>
              <span>This will replace the existing connection between these chunks</span>
            </div>
          {/if}
        </div>

        <!-- Keyframe details -->
        {#if selectedSourceChunk && selectedTargetChunk}
          <div class="form-section">
            <h3>Keyframe Details</h3>
            
            <div class="form-group">
              <label for="keyframe-title">Title *</label>
              <input
                id="keyframe-title"
                type="text"
                bind:value={keyframeTitle}
                placeholder="Enter keyframe title..."
                maxlength="100"
              />
            </div>

            <div class="form-group">
              <label for="transition-type">Transition Type</label>
              <select id="transition-type" bind:value={transitionType}>
                <option value="smooth">Smooth - Gradual transition</option>
                <option value="cut">Cut - Sharp transition</option>
                <option value="fade">Fade - Dissolve transition</option>
              </select>
            </div>

            <div class="form-group">
              <label for="keyframe-prompt">Image Prompt *</label>
              <textarea
                id="keyframe-prompt"
                bind:value={keyframePrompt}
                placeholder="Describe the keyframe image..."
                rows="3"
                maxlength="500"
              ></textarea>
              <button
                class="auto-generate-btn"
                onclick={generateTransitionPrompt}
                type="button"
              >
                🎯 Auto-generate prompt
              </button>
            </div>
          </div>

          <!-- Generated image preview -->
          {#if isGenerating}
            <div class="generation-progress">
              <div class="progress-content">
                <div class="spinner"></div>
                <span>Generating keyframe image...</span>
              </div>
            </div>
          {:else if generatedImage}
            <div class="form-section">
              <h3>Generated Keyframe</h3>
              <div class="keyframe-preview">
                <img src={generatedImage.url} alt={generatedImage.prompt} />
                <div class="preview-info">
                  <div class="preview-title">{keyframeTitle}</div>
                  <div class="preview-prompt">{generatedImage.prompt}</div>
                </div>
              </div>
            </div>
          {/if}

          <!-- Chunk preview -->
          <div class="form-section">
            <h3>Connection Preview</h3>
            <div class="connection-preview">
              <div class="chunk-preview">
                <div class="chunk-title">{selectedSourceChunk.title}</div>
                {#if selectedSourceChunk.images.length > 0}
                  <img src={selectedSourceChunk.images[selectedSourceChunk.images.length - 1].url} alt="Source" />
                {:else}
                  <div class="no-image">No image</div>
                {/if}
              </div>

              <div class="transition-arrow">
                <div class="arrow-line"></div>
                {#if generatedImage}
                  <div class="keyframe-dot">
                    <img src={generatedImage.url} alt="Keyframe" />
                  </div>
                {:else}
                  <div class="keyframe-placeholder">?</div>
                {/if}
                <div class="arrow-head">→</div>
              </div>

              <div class="chunk-preview">
                <div class="chunk-title">{selectedTargetChunk.title}</div>
                {#if selectedTargetChunk.images.length > 0}
                  <img src={selectedTargetChunk.images[0].url} alt="Target" />
                {:else}
                  <div class="no-image">No image</div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="inserter-footer">
        <div class="footer-info">
          {#if generatedImage}
            <span class="success-text">✓ Keyframe ready to insert</span>
          {:else if canInsert}
            <span class="info-text">Ready to generate keyframe</span>
          {:else}
            <span class="warning-text">Select chunks and enter details</span>
          {/if}
        </div>

        <div class="footer-actions">
          <button class="btn secondary" onclick={close}>Cancel</button>
          
          {#if !generatedImage}
            <button
              class="btn primary"
              onclick={generateKeyframe}
              disabled={!canInsert || isGenerating}
            >
              {#if isGenerating}
                Generating...
              {:else}
                Generate Keyframe
              {/if}
            </button>
          {:else}
            <button class="btn success" onclick={insertKeyframe}>
              Insert Keyframe
            </button>
          {/if}
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

  .keyframe-inserter {
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

  .inserter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .inserter-header h2 {
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

  .inserter-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-section h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .chunk-selection {
    display: flex;
    align-items: end;
    gap: 16px;
  }

  .arrow {
    font-size: 24px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .auto-generate-btn {
    align-self: flex-start;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .auto-generate-btn:hover {
    background: #e5e7eb;
  }

  .connection-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    font-size: 14px;
    color: #92400e;
  }

  .generation-progress {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
  }

  .progress-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 14px;
    color: #374151;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .keyframe-preview {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .keyframe-preview img {
    width: 120px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
  }

  .preview-info {
    flex: 1;
  }

  .preview-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .preview-prompt {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
  }

  .connection-preview {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .chunk-preview {
    text-align: center;
    flex: 1;
  }

  .chunk-title {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  .chunk-preview img {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .no-image {
    width: 80px;
    height: 60px;
    background: #f3f4f6;
    border: 1px dashed #d1d5db;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #9ca3af;
  }

  .transition-arrow {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  .arrow-line {
    width: 40px;
    height: 2px;
    background: #3b82f6;
  }

  .keyframe-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #3b82f6;
    background: white;
  }

  .keyframe-dot img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .keyframe-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px dashed #d1d5db;
    background: #f9fafb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #9ca3af;
  }

  .arrow-head {
    font-size: 20px;
    color: #3b82f6;
  }

  .inserter-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .footer-info {
    font-size: 14px;
  }

  .success-text {
    color: #059669;
    font-weight: 500;
  }

  .info-text {
    color: #3b82f6;
  }

  .warning-text {
    color: #d97706;
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

  .btn.primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn.success {
    background: #059669;
    color: white;
  }

  .btn.success:hover {
    background: #047857;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
