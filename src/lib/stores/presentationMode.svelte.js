/**
 * Runes-based store for managing presentation mode and client deck features
 */

/**
 * Presentation mode store using SvelteKit 5 Runes
 */
function createPresentationModeStore() {
  let isPresenting = $state(false);
  let currentSlide = $state(0);
  let presentationTitle = $state('Storyboard Presentation');
  let presentationNotes = $state('');
  let slideTransition = $state('fade'); // 'fade', 'slide', 'none'
  let autoAdvance = $state(false);
  let autoAdvanceDelay = $state(5000); // milliseconds
  let showNotes = $state(false);
  let fullscreen = $state(false);

  // Export settings
  let exportFormat = $state('pdf'); // 'pdf', 'pptx', 'html'
  let exportQuality = $state('high'); // 'low', 'medium', 'high'
  let includeNotes = $state(true);
  let includeMetadata = $state(true);

  // Layout settings
  let slidesPerPage = $state(1);
  let pageOrientation = $state('landscape'); // 'portrait', 'landscape'
  let showChunkConnections = $state(true);
  let showImageCaptions = $state(true);

  // This will be set by the component using the store
  let totalSlides = $state(0);
  let slides = $state([]);

  // Derived states
  const canGoNext = $derived(() => currentSlide < totalSlides - 1);
  const canGoPrevious = $derived(() => currentSlide > 0);
  const progressPercentage = $derived(() =>
    totalSlides > 0 ? (currentSlide / totalSlides) * 100 : 0
  );

  /**
   * Start presentation mode
   * @param {Array} slideData - Array of slide data
   */
  function startPresentation(slideData = []) {
    slides = slideData;
    totalSlides = slideData.length;
    currentSlide = 0;
    isPresenting = true;
  }

  /**
   * End presentation mode
   */
  function endPresentation() {
    isPresenting = false;
    currentSlide = 0;
    fullscreen = false;
  }

  /**
   * Go to next slide
   */
  function nextSlide() {
    if (canGoNext) {
      currentSlide++;
    }
  }

  /**
   * Go to previous slide
   */
  function previousSlide() {
    if (canGoPrevious) {
      currentSlide--;
    }
  }

  /**
   * Go to specific slide
   * @param {number} slideIndex - Index of the slide to go to
   */
  function goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < totalSlides) {
      currentSlide = slideIndex;
    }
  }

  /**
   * Toggle fullscreen mode
   */
  function toggleFullscreen() {
    fullscreen = !fullscreen;

    if (fullscreen) {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Toggle auto-advance
   */
  function toggleAutoAdvance() {
    autoAdvance = !autoAdvance;
  }

  /**
   * Toggle presentation notes
   */
  function toggleNotes() {
    showNotes = !showNotes;
  }

  /**
   * Update presentation settings
   * @param {Object} settings - Settings to update
   */
  function updateSettings(settings) {
    Object.assign({
      exportFormat,
      exportQuality,
      includeNotes,
      includeMetadata,
      slidesPerPage,
      pageOrientation,
      showChunkConnections,
      showImageCaptions,
      slideTransition,
      autoAdvance,
      autoAdvanceDelay,
      showNotes,
      presentationTitle,
      presentationNotes
    }, settings);
  }

  /**
   * Generate slide data from chunks
   * @param {Array} chunks - Array of story chunks
   * @param {Array} connections - Array of story connections
   * @returns {Array} Array of slide data
   */
  function generateSlidesFromChunks(chunks, connections) {
    const slideData = [];

    // Title slide
    slideData.push({
      id: 'title',
      type: 'title',
      title: presentationTitle,
      subtitle: `${chunks.length} Story Chunks`,
      notes: presentationNotes
    });

    // Overview slide with story flow
    slideData.push({
      id: 'overview',
      type: 'overview',
      title: 'Story Overview',
      chunks: chunks,
      connections: connections,
      notes: 'High-level view of the story structure and flow'
    });

    // Individual chunk slides
    chunks.forEach((chunk, index) => {
      slideData.push({
        id: chunk.id,
        type: 'chunk',
        title: chunk.title,
        description: chunk.description,
        chunk: chunk,
        chunkIndex: index + 1,
        totalChunks: chunks.length,
        images: chunk.images,
        connections: connections.filter(conn =>
          conn.sourceChunkId === chunk.id || conn.targetChunkId === chunk.id
        ),
        notes: chunk.metadata.notes || ''
      });
    });

    // Summary slide
    slideData.push({
      id: 'summary',
      type: 'summary',
      title: 'Summary',
      totalChunks: chunks.length,
      totalImages: chunks.reduce((sum, chunk) => sum + chunk.images.length, 0),
      totalConnections: connections.length,
      notes: 'Project summary and next steps'
    });

    slides = slideData;
    totalSlides = slideData.length;

    return slideData;
  }

  /**
   * Export presentation data
   * @returns {Object} Export data
   */
  function exportPresentationData() {
    return {
      title: presentationTitle,
      notes: presentationNotes,
      slides: slides,
      settings: {
        slideTransition: slideTransition,
        slidesPerPage: slidesPerPage,
        pageOrientation: pageOrientation,
        showChunkConnections: showChunkConnections,
        showImageCaptions: showImageCaptions,
        includeNotes: includeNotes,
        includeMetadata: includeMetadata,
        exportQuality: exportQuality
      },
      metadata: {
        createdAt: Date.now(),
        totalSlides: totalSlides,
        exportFormat: exportFormat
      }
    };
  }

  /**
   * Load presentation data
   * @param {Object} data - Presentation data to load
   */
  function loadPresentationData(data) {
    presentationTitle = data.title || 'Storyboard Presentation';
    presentationNotes = data.notes || '';
    slides = data.slides || [];
    totalSlides = slides.length;

    if (data.settings) {
      Object.assign({
        slideTransition,
        slidesPerPage,
        pageOrientation,
        showChunkConnections,
        showImageCaptions,
        includeNotes,
        includeMetadata,
        exportQuality
      }, data.settings);
    }
  }

  /**
   * Reset presentation to defaults
   */
  function reset() {
    isPresenting = false;
    currentSlide = 0;
    presentationTitle = 'Storyboard Presentation';
    presentationNotes = '';
    slideTransition = 'fade';
    autoAdvance = false;
    autoAdvanceDelay = 5000;
    showNotes = false;
    fullscreen = false;
    exportFormat = 'pdf';
    exportQuality = 'high';
    includeNotes = true;
    includeMetadata = true;
    slidesPerPage = 1;
    pageOrientation = 'landscape';
    showChunkConnections = true;
    showImageCaptions = true;
    totalSlides = 0;
    slides = [];
  }

  /**
   * Get current slide data
   * @returns {Object|null} Current slide data
   */
  function getCurrentSlide() {
    return slides[currentSlide] || null;
  }

  /**
   * Get slide by ID
   * @param {string} slideId - ID of the slide
   * @returns {Object|null} Slide data or null if not found
   */
  function getSlideById(slideId) {
    return slides.find(slide => slide.id === slideId) || null;
  }

  /**
   * Update slide notes
   * @param {string} slideId - ID of the slide
   * @param {string} notes - New notes content
   */
  function updateSlideNotes(slideId, notes) {
    const slide = getSlideById(slideId);
    if (slide) {
      slide.notes = notes;
    }
  }

  return {
    // State getters
    get isPresenting() { return isPresenting; },
    get currentSlide() { return currentSlide; },
    get presentationTitle() { return presentationTitle; },
    get presentationNotes() { return presentationNotes; },
    get slideTransition() { return slideTransition; },
    get autoAdvance() { return autoAdvance; },
    get autoAdvanceDelay() { return autoAdvanceDelay; },
    get showNotes() { return showNotes; },
    get fullscreen() { return fullscreen; },
    get exportFormat() { return exportFormat; },
    get exportQuality() { return exportQuality; },
    get includeNotes() { return includeNotes; },
    get includeMetadata() { return includeMetadata; },
    get slidesPerPage() { return slidesPerPage; },
    get pageOrientation() { return pageOrientation; },
    get showChunkConnections() { return showChunkConnections; },
    get showImageCaptions() { return showImageCaptions; },
    get totalSlides() { return totalSlides; },
    get slides() { return slides; },

    // Derived getters
    get canGoNext() { return canGoNext; },
    get canGoPrevious() { return canGoPrevious; },
    get progressPercentage() { return progressPercentage; },

    // Methods
    startPresentation,
    endPresentation,
    nextSlide,
    previousSlide,
    goToSlide,
    toggleFullscreen,
    toggleAutoAdvance,
    toggleNotes,
    updateSettings,
    generateSlidesFromChunks,
    exportPresentationData,
    loadPresentationData,
    reset,
    getCurrentSlide,
    getSlideById,
    updateSlideNotes
  };
}

// Create and export the store instance
export const presentationModeStore = createPresentationModeStore();
