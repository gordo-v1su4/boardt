<!--
  ChunkCreator.svelte - Multi-prompt story sequence creator
  Task 8: Story Sequence Manager - ChunkCreator for multi-prompt story generation
-->
<script lang="ts">
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { imageGenerationStore } from '../../stores/imageGeneration.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';

  // Props for Svelte 5
  interface Props {
    onChunkCreated?: (chunk: any) => void;
    onCancel?: () => void;
  }

  let { onChunkCreated, onCancel }: Props = $props();

  // Component state using Svelte 5 Runes
  let chunkTitle = $state('');
  let chunkDescription = $state('');
  let chunkType = $state('sequence');
  let prompts = $state(['']);
  let isGenerating = $state(false);
  let generationProgress = $state(0);
  let generatedImages = $state([]);
  // Derived state
  let canCreate = $derived(() => chunkTitle.trim() && prompts.some(p => p.trim()));
  let totalPrompts = $derived(() => prompts.filter(p => p.trim()).length);
  let isChoiceChunk = $derived(() => chunkType === 'choice');

  /**
   * Add new prompt input
   */
  function addPrompt() {
    prompts = [...prompts, ''];
  }

  /**
   * Remove prompt at index
   */
  function removePrompt(index) {
    if (prompts.length > 1) {
      prompts = prompts.filter((_, i) => i !== index);
    }
  }

  /**
   * Update prompt at index
   */
  function updatePrompt(index, value) {
    prompts[index] = value;
    prompts = [...prompts]; // Trigger reactivity
  }

  /**
   * Generate images for all prompts
   */
  async function generateImages() {
    if (!canCreate) return;

    isGenerating = true;
    generationProgress = 0;
    generatedImages = [];

    const validPrompts = prompts.filter(p => p.trim());
    
    try {
      for (let i = 0; i < validPrompts.length; i++) {
        const prompt = validPrompts[i];
        generationProgress = (i / validPrompts.length) * 100;

        const image = await imageGenerationStore.generateImage(prompt);
        if (image) {
          generatedImages = [...generatedImages, image];
        }

        // Small delay between generations
        if (i < validPrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      generationProgress = 100;
    } catch (error) {
      console.error('Batch generation failed:', error);
    } finally {
      isGenerating = false;
    }
  }

  /**
   * Create chunk with generated images
   */
  function createChunk() {
    if (!canCreate) return;

    // Calculate position for new chunk
    const centerX = -uiStore.canvasPosition.x + (window.innerWidth / 2) / uiStore.canvasZoom;
    const centerY = -uiStore.canvasPosition.y + (window.innerHeight / 2) / uiStore.canvasZoom;

    const newChunk = storyChunksStore.addChunk({
      title: chunkTitle.trim(),
      description: chunkDescription.trim(),
      chunkType,
      images: generatedImages,
      position: { x: centerX, y: centerY }
    });

    // Select the new chunk
    storyChunksStore.selectChunk(newChunk.id);
    uiStore.selectItems(newChunk.id);

    // Close the creator
    close();

    dispatch('chunkCreated', { chunk: newChunk });
  }

  /**
   * Close the creator
   */
  function close() {
    uiStore.closeChunkCreator();
    reset();
  }

  /**
   * Reset form
   */
  function reset() {
    chunkTitle = '';
    chunkDescription = '';
    chunkType = 'sequence';
    prompts = [''];
    isGenerating = false;
    generationProgress = 0;
    generatedImages = [];
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      if (generatedImages.length > 0) {
        createChunk();
      } else if (canCreate) {
        generateImages();
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if uiStore.showChunkCreator}
  <div
    class="modal-overlay"
    onclick={(e) => { if (e.target === e.currentTarget) close(); }}
    onkeydown={(e) => { if (e.key === 'Escape') close(); }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="chunk-creator">
      <div class="creator-header">
        <h2>Create Story Sequence</h2>
        <button class="close-btn" onclick={close} title="Close">×</button>
      </div>

      <div class="creator-content">
        <!-- Chunk metadata -->
        <div class="form-section">
          <div class="form-group">
            <label for="chunk-title">Chunk Title *</label>
            <input
              id="chunk-title"
              type="text"
              bind:value={chunkTitle}
              placeholder="Enter chunk title..."
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="chunk-description">Description</label>
            <textarea
              id="chunk-description"
              bind:value={chunkDescription}
              placeholder="Describe this story sequence..."
              rows="2"
              maxlength="500"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="chunk-type">Chunk Type</label>
            <select id="chunk-type" bind:value={chunkType}>
              <option value="sequence">Sequence - Linear story progression</option>
              <option value="choice">Choice - Branching decision point</option>
              <option value="keyframe">Keyframe - Important story moment</option>
            </select>
          </div>
        </div>

        <!-- Prompts section -->
        <div class="form-section">
          <div class="section-header">
            <h3>Image Prompts ({totalPrompts})</h3>
            <button class="add-prompt-btn" onclick={addPrompt}>+ Add Prompt</button>
          </div>

          <div class="prompts-list">
            {#each prompts as prompt, index}
              <div class="prompt-item">
                <div class="prompt-number">{index + 1}</div>
                <textarea
                  bind:value={prompts[index]}
                  placeholder="Describe the image you want to generate..."
                  rows="2"
                  maxlength="500"
                ></textarea>
                {#if prompts.length > 1}
                  <button
                    class="remove-prompt-btn"
                    onclick={() => removePrompt(index)}
                    title="Remove prompt"
                  >
                    ×
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Generation progress -->
        {#if isGenerating}
          <div class="generation-progress">
            <div class="progress-header">
              <span>Generating images...</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {generationProgress}%"></div>
            </div>
          </div>
        {/if}

        <!-- Generated images preview -->
        {#if generatedImages.length > 0}
          <div class="form-section">
            <h3>Generated Images ({generatedImages.length})</h3>
            <div class="images-preview">
              {#each generatedImages as image, index}
                <div class="preview-item">
                  <img src={image.url} alt={image.prompt} />
                  <div class="image-info">
                    <div class="image-index">{index + 1}</div>
                    <div class="image-prompt">{image.prompt.slice(0, 50)}...</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="creator-footer">
        <div class="footer-info">
          {#if generatedImages.length > 0}
            <span class="success-text">✓ {generatedImages.length} images generated</span>
          {:else if totalPrompts > 0}
            <span class="info-text">Ready to generate {totalPrompts} images</span>
          {:else}
            <span class="warning-text">Add at least one prompt</span>
          {/if}
        </div>

        <div class="footer-actions">
          <button class="btn secondary" onclick={close}>Cancel</button>
          
          {#if generatedImages.length === 0}
            <button
              class="btn primary"
              onclick={generateImages}
              disabled={!canCreate || isGenerating}
            >
              {#if isGenerating}
                Generating...
              {:else}
                Generate Images
              {/if}
            </button>
          {:else}
            <button class="btn success" onclick={createChunk}>
              Create Chunk
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

  .chunk-creator {
    background: #27272a; /* zinc-800 */
    border: 1px solid #3f3f46; /* zinc-700 */
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .creator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #3f3f46; /* zinc-700 */
  }

  .creator-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #fafafa; /* zinc-50 */
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #a1a1aa; /* zinc-400 */
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: #3f3f46; /* zinc-700 */
    color: #e4e4e7; /* zinc-200 */
  }

  .creator-content {
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

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  .add-prompt-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-prompt-btn:hover {
    background: #e5e7eb;
  }

  .prompts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .prompt-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .prompt-number {
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .prompt-item textarea {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 13px;
    resize: vertical;
    min-height: 40px;
  }

  .remove-prompt-btn {
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #dc2626;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 2px;
    transition: all 0.2s ease;
  }

  .remove-prompt-btn:hover {
    background: #fecaca;
  }

  .generation-progress {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .progress-bar {
    background: #e5e7eb;
    border-radius: 4px;
    height: 8px;
    overflow: hidden;
  }

  .progress-fill {
    background: #3b82f6;
    height: 100%;
    transition: width 0.3s ease;
  }

  .images-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .preview-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .preview-item img {
    width: 100%;
    height: 80px;
    object-fit: cover;
  }

  .image-info {
    padding: 8px;
  }

  .image-index {
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
    margin-bottom: 2px;
  }

  .image-prompt {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.3;
  }

  .creator-footer {
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
