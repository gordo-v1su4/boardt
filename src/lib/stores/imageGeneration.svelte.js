/**
 * Runes-based store for managing AI image generation
 */
import { StoryboardImage } from '../types/storyboard.js';

/**
 * Image generation store using SvelteKit 5 Runes
 */
function createImageGenerationStore() {
  let isGenerating = $state(false);
  let currentPrompt = $state('');
  let generationProgress = $state(0);
  let error = $state(null);
  let generatedImages = $state([]);

  // Generation settings
  let imageSize = $state('square_hd'); // 'square_hd', 'square', 'portrait_4_3', etc.
  let numInferenceSteps = $state(50);
  let guidanceScale = $state(7.5);
  let numImages = $state(1);
  let enableSafetyChecker = $state(true);
  let seed = $state(null);

  // Batch generation
  let batchPrompts = $state([]);
  let batchProgress = $state(0);
  let batchTotal = $state(0);
  let isBatchGenerating = $state(false);

  // History
  let generationHistory = $state([]);
  let maxHistorySize = $state(50);

  // Derived states
  const canGenerate = $derived(() =>
    !isGenerating && !isBatchGenerating && currentPrompt.trim().length > 0
  );

  const canBatchGenerate = $derived(() =>
    !isGenerating && !isBatchGenerating && batchPrompts.length > 0
  );

  const totalGeneratedImages = $derived(() => generatedImages.length);

  const recentImages = $derived(() =>
    generatedImages.slice(-10).reverse()
  );

  /**
   * Set current prompt
   * @param {string} prompt - The prompt text
   */
  function setPrompt(prompt) {
    currentPrompt = prompt;
    error = null;
  }

  /**
   * Update generation settings
   * @param {Object} settings - Settings to update
   */
  function updateSettings(settings) {
    Object.assign({
      imageSize,
      numInferenceSteps,
      guidanceScale,
      numImages,
      enableSafetyChecker,
      seed
    }, settings);
  }

  /**
   * Generate a single image
   * @param {string} prompt - Optional prompt override
   * @returns {Promise<StoryboardImage|null>} Generated image or null if failed
   */
  async function generateImage(prompt = null) {
    const promptToUse = prompt || currentPrompt;

    if (!promptToUse.trim()) {
      error = 'Prompt cannot be empty';
      return null;
    }

    isGenerating = true;
    generationProgress = 0;
    error = null;

    try {
      // Import fal.ai service dynamically to avoid SSR issues
      const { generateImage: generateImageAPI } = await import('../services/falai.js');
      
      const options = {
        prompt: promptToUse,
        size: imageSize,
        steps: numInferenceSteps,
        guidance: guidanceScale,
        seed: seed
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (generationProgress < 90) {
          generationProgress += Math.random() * 20;
        }
      }, 500);

      const result = await generateImageAPI(options);

      clearInterval(progressInterval);
      generationProgress = 100;

      if (result.success && result.data) {
        const image = new StoryboardImage({
          url: result.data.url,
          prompt: promptToUse,
          metadata: {
            width: result.data.metadata.width,
            height: result.data.metadata.height,
            seed: result.data.metadata.seed,
            steps: numInferenceSteps,
            guidance: guidanceScale,
            timestamp: Date.now()
          }
        });

        generatedImages.push(image);
        addToHistory(promptToUse, image);

        isGenerating = false;
        return image;
      } else {
        throw new Error(result.error?.message || 'Image generation failed');
      }
    } catch (err) {
      clearInterval(progressInterval);
      error = err.message;
      isGenerating = false;
      generationProgress = 0;
      return null;
    }
  }

  /**
   * Generate multiple images from batch prompts
   * @returns {Promise<StoryboardImage[]>} Array of generated images
   */
  async function generateBatch() {
    if (batchPrompts.length === 0) {
      error = 'No prompts in batch';
      return [];
    }

    isBatchGenerating = true;
    batchProgress = 0;
    batchTotal = batchPrompts.length;
    error = null;

    const generatedImagesList = [];

    try {
      for (let i = 0; i < batchPrompts.length; i++) {
        const prompt = batchPrompts[i];
        currentPrompt = prompt;

        const image = await generateImage(prompt);
        if (image) {
          generatedImagesList.push(image);
        }

        batchProgress = i + 1;

        // Small delay between generations to avoid rate limiting
        if (i < batchPrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      error = err.message;
    } finally {
      isBatchGenerating = false;
      batchProgress = 0;
      batchTotal = 0;
    }

    return generatedImagesList;
  }

  /**
   * Add prompt to batch
   * @param {string} prompt - Prompt to add
   */
  function addToBatch(prompt) {
    if (prompt.trim() && !batchPrompts.includes(prompt.trim())) {
      batchPrompts.push(prompt.trim());
    }
  }

  /**
   * Remove prompt from batch
   * @param {number} index - Index of prompt to remove
   */
  function removeFromBatch(index) {
    if (index >= 0 && index < batchPrompts.length) {
      batchPrompts.splice(index, 1);
    }
  }

  /**
   * Clear batch prompts
   */
  function clearBatch() {
    batchPrompts = [];
  }

  /**
   * Cancel current generation
   */
  function cancelGeneration() {
    isGenerating = false;
    isBatchGenerating = false;
    generationProgress = 0;
    batchProgress = 0;
    batchTotal = 0;
  }

  /**
   * Remove generated image
   * @param {string} imageId - ID of image to remove
   */
  function removeGeneratedImage(imageId) {
    generatedImages = generatedImages.filter(img => img.id !== imageId);
  }

  /**
   * Clear all generated images
   */
  function clearGeneratedImages() {
    generatedImages = [];
  }

  /**
   * Add generation to history
   * @param {string} prompt - The prompt used
   * @param {StoryboardImage} image - The generated image
   */
  function addToHistory(prompt, image) {
    const historyEntry = {
      id: crypto.randomUUID(),
      prompt,
      imageId: image.id,
      timestamp: Date.now(),
      settings: {
        imageSize: imageSize,
        numInferenceSteps: numInferenceSteps,
        guidanceScale: guidanceScale,
        seed: seed
      }
    };

    generationHistory.unshift(historyEntry);

    // Limit history size
    if (generationHistory.length > maxHistorySize) {
      generationHistory = generationHistory.slice(0, maxHistorySize);
    }
  }

  /**
   * Clear generation history
   */
  function clearHistory() {
    generationHistory = [];
  }

  /**
   * Get history entry by ID
   * @param {string} entryId - ID of the history entry
   * @returns {Object|null} History entry or null if not found
   */
  function getHistoryEntry(entryId) {
    return generationHistory.find(entry => entry.id === entryId) || null;
  }

  /**
   * Regenerate image from history
   * @param {string} entryId - ID of the history entry
   * @returns {Promise<StoryboardImage|null>} Regenerated image
   */
  async function regenerateFromHistory(entryId) {
    const entry = getHistoryEntry(entryId);
    if (!entry) {
      error = 'History entry not found';
      return null;
    }

    // Temporarily apply the historical settings
    const currentSettings = {
      imageSize: imageSize,
      numInferenceSteps: numInferenceSteps,
      guidanceScale: guidanceScale,
      seed: seed
    };

    updateSettings(entry.settings);

    const image = await generateImage(entry.prompt);

    // Restore current settings
    updateSettings(currentSettings);

    return image;
  }

  /**
   * Export generation data
   * @returns {Object} Export data
   */
  function exportData() {
    return {
      generatedImages: generatedImages.map(img => img.toJSON()),
      generationHistory: generationHistory,
      settings: {
        imageSize: imageSize,
        numInferenceSteps: numInferenceSteps,
        guidanceScale: guidanceScale,
        numImages: numImages,
        enableSafetyChecker: enableSafetyChecker
      }
    };
  }

  /**
   * Load generation data
   * @param {Object} data - Data to load
   */
  function loadData(data) {
    if (data.generatedImages) {
      generatedImages = data.generatedImages.map(imgData =>
        new StoryboardImage(imgData)
      );
    }

    if (data.generationHistory) {
      generationHistory = data.generationHistory;
    }

    if (data.settings) {
      updateSettings(data.settings);
    }
  }

  /**
   * Reset store to defaults
   */
  function reset() {
    isGenerating = false;
    currentPrompt = '';
    generationProgress = 0;
    error = null;
    generatedImages = [];
    imageSize = 'square_hd';
    numInferenceSteps = 50;
    guidanceScale = 7.5;
    numImages = 1;
    enableSafetyChecker = true;
    seed = null;
    batchPrompts = [];
    batchProgress = 0;
    batchTotal = 0;
    isBatchGenerating = false;
    generationHistory = [];
  }

  return {
    // State getters
    get isGenerating() { return isGenerating; },
    get currentPrompt() { return currentPrompt; },
    get generationProgress() { return generationProgress; },
    get error() { return error; },
    get generatedImages() { return generatedImages; },
    get imageSize() { return imageSize; },
    get numInferenceSteps() { return numInferenceSteps; },
    get guidanceScale() { return guidanceScale; },
    get numImages() { return numImages; },
    get enableSafetyChecker() { return enableSafetyChecker; },
    get seed() { return seed; },
    get batchPrompts() { return batchPrompts; },
    get batchProgress() { return batchProgress; },
    get batchTotal() { return batchTotal; },
    get isBatchGenerating() { return isBatchGenerating; },
    get generationHistory() { return generationHistory; },
    get maxHistorySize() { return maxHistorySize; },

    // Derived getters
    get canGenerate() { return canGenerate; },
    get canBatchGenerate() { return canBatchGenerate; },
    get totalGeneratedImages() { return totalGeneratedImages; },
    get recentImages() { return recentImages; },

    // Methods
    setPrompt,
    updateSettings,
    generateImage,
    generateBatch,
    addToBatch,
    removeFromBatch,
    clearBatch,
    cancelGeneration,
    removeGeneratedImage,
    clearGeneratedImages,
    addToHistory,
    clearHistory,
    getHistoryEntry,
    regenerateFromHistory,
    exportData,
    loadData,
    reset
  };
}

// Create and export the store instance
export const imageGenerationStore = createImageGenerationStore();
