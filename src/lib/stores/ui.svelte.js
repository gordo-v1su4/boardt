/**
 * Runes-based store for managing UI state and view switching
 */

/**
 * UI state store using SvelteKit 5 Runes
 */
function createUIStore() {
  let currentView = $state('canvas'); // 'canvas', 'presentation', 'set'
  let sidebarOpen = $state(true);
  let toolbarVisible = $state(true);
  let loading = $state(false);
  let error = $state(null);

  // Canvas-specific UI state
  let canvasZoom = $state(1);
  let canvasPosition = $state({ x: 0, y: 0 });
  let showGrid = $state(true);
  let snapToGrid = $state(true);
  let gridSize = $state(20);

  // Modals and dialogs
  let showChunkCreator = $state(false);
  let showKeyframeInserter = $state(false);
  let showExportDialog = $state(false);
  let showSettingsDialog = $state(false);
  let showConnectionValidator = $state(false);

  // Selection and interaction state
  let selectedItems = $state([]);
  let draggedItem = $state(null);
  let hoveredItem = $state(null);
  let contextMenuOpen = $state(false);
  let contextMenuPosition = $state({ x: 0, y: 0 });

  // Keyboard shortcuts
  let keyboardShortcutsEnabled = $state(true);

  // Theme and appearance
  let theme = $state('light'); // 'light', 'dark', 'auto'
  let compactMode = $state(false);

  // Derived states
  const isCanvasView = $derived(() => currentView === 'canvas');
  const isPresentationView = $derived(() => currentView === 'presentation');
  const isSetView = $derived(() => currentView === 'set');

  const hasSelection = $derived(() => selectedItems.length > 0);
  const multipleSelection = $derived(() => selectedItems.length > 1);

  const canZoomIn = $derived(() => canvasZoom < 3);
  const canZoomOut = $derived(() => canvasZoom > 0.1);

  /**
   * Switch to a different view
   * @param {string} view - View to switch to ('canvas', 'presentation', 'set')
   */
  function switchView(view) {
    if (['canvas', 'presentation', 'set'].includes(view)) {
      currentView = view;
      clearSelection();
      closeContextMenu();
    }
  }

  /**
   * Toggle sidebar visibility
   */
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  /**
   * Toggle toolbar visibility
   */
  function toggleToolbar() {
    toolbarVisible = !toolbarVisible;
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  function setLoading(loadingState) {
    loading = loadingState;
    if (loadingState) {
      error = null;
    }
  }

  /**
   * Set error state
   * @param {string|null} error - Error message or null to clear
   */
  function setError(errorMessage) {
    error = errorMessage;
    if (errorMessage) {
      loading = false;
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error = null;
  }

  /**
   * Update canvas zoom
   * @param {number} zoom - New zoom level
   */
  function setCanvasZoom(zoom) {
    canvasZoom = Math.max(0.1, Math.min(3, zoom));
  }

  /**
   * Zoom in on canvas
   */
  function zoomIn() {
    setCanvasZoom(canvasZoom * 1.2);
  }

  /**
   * Zoom out on canvas
   */
  function zoomOut() {
    setCanvasZoom(canvasZoom / 1.2);
  }

  /**
   * Reset canvas zoom to 100%
   */
  function resetZoom() {
    setCanvasZoom(1);
  }

  /**
   * Update canvas position
   * @param {Object} position - New position {x, y}
   */
  function setCanvasPosition(position) {
    canvasPosition = { ...position };
  }

  /**
   * Toggle grid visibility
   */
  function toggleGrid() {
    showGrid = !showGrid;
  }

  /**
   * Toggle snap to grid
   */
  function toggleSnapToGrid() {
    snapToGrid = !snapToGrid;
  }

  /**
   * Set grid size
   * @param {number} size - Grid size in pixels
   */
  function setGridSize(size) {
    gridSize = Math.max(10, Math.min(50, size));
  }

  /**
   * Show chunk creator modal
   */
  function openChunkCreator() {
    showChunkCreator = true;
  }

  /**
   * Hide chunk creator modal
   */
  function closeChunkCreator() {
    showChunkCreator = false;
  }

  /**
   * Show keyframe inserter modal
   */
  function openKeyframeInserter() {
    showKeyframeInserter = true;
  }

  /**
   * Hide keyframe inserter modal
   */
  function closeKeyframeInserter() {
    showKeyframeInserter = false;
  }

  /**
   * Show export dialog
   */
  function openExportDialog() {
    showExportDialog = true;
  }

  /**
   * Hide export dialog
   */
  function closeExportDialog() {
    showExportDialog = false;
  }

  /**
   * Show settings dialog
   */
  function openSettingsDialog() {
    showSettingsDialog = true;
  }

  /**
   * Hide settings dialog
   */
  function closeSettingsDialog() {
    showSettingsDialog = false;
  }

  /**
   * Show connection validator
   */
  function openConnectionValidator() {
    showConnectionValidator = true;
  }

  /**
   * Hide connection validator
   */
  function closeConnectionValidator() {
    showConnectionValidator = false;
  }

  /**
   * Select items
   * @param {Array|string} items - Item IDs to select
   * @param {boolean} addToSelection - Whether to add to existing selection
   */
  function selectItems(items, addToSelection = false) {
    const itemArray = Array.isArray(items) ? items : [items];

    if (addToSelection) {
      // Add to existing selection, avoiding duplicates
      const newItems = itemArray.filter(item => !selectedItems.includes(item));
      selectedItems = [...selectedItems, ...newItems];
    } else {
      selectedItems = [...itemArray];
    }
  }

  /**
   * Deselect items
   * @param {Array|string} items - Item IDs to deselect
   */
  function deselectItems(items) {
    const itemArray = Array.isArray(items) ? items : [items];
    selectedItems = selectedItems.filter(item => !itemArray.includes(item));
  }

  /**
   * Clear all selections
   */
  function clearSelection() {
    selectedItems = [];
  }

  /**
   * Check if item is selected
   * @param {string} itemId - Item ID to check
   * @returns {boolean} Whether the item is selected
   */
  function isSelected(itemId) {
    return selectedItems.includes(itemId);
  }

  /**
   * Set dragged item
   * @param {string|null} itemId - ID of the item being dragged
   */
  function setDraggedItem(itemId) {
    draggedItem = itemId;
  }

  /**
   * Set hovered item
   * @param {string|null} itemId - ID of the item being hovered
   */
  function setHoveredItem(itemId) {
    hoveredItem = itemId;
  }

  /**
   * Show context menu
   * @param {Object} position - Position {x, y} for the context menu
   */
  function showContextMenu(position) {
    contextMenuPosition = { ...position };
    contextMenuOpen = true;
  }

  /**
   * Hide context menu
   */
  function closeContextMenu() {
    contextMenuOpen = false;
  }

  /**
   * Toggle theme
   */
  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }

  /**
   * Set theme
   * @param {string} theme - Theme to set ('light', 'dark', 'auto')
   */
  function setTheme(themeValue) {
    if (['light', 'dark', 'auto'].includes(themeValue)) {
      theme = themeValue;
    }
  }

  /**
   * Toggle compact mode
   */
  function toggleCompactMode() {
    compactMode = !compactMode;
  }

  /**
   * Reset UI state to defaults
   */
  function reset() {
    currentView = 'canvas';
    sidebarOpen = true;
    toolbarVisible = true;
    loading = false;
    error = null;
    canvasZoom = 1;
    canvasPosition = { x: 0, y: 0 };
    showGrid = true;
    snapToGrid = true;
    gridSize = 20;
    showChunkCreator = false;
    showKeyframeInserter = false;
    showExportDialog = false;
    showSettingsDialog = false;
    showConnectionValidator = false;
    selectedItems = [];
    draggedItem = null;
    hoveredItem = null;
    contextMenuOpen = false;
    contextMenuPosition = { x: 0, y: 0 };
    theme = 'light';
    compactMode = false;
  }

  return {
    // State getters
    get currentView() { return currentView; },
    get sidebarOpen() { return sidebarOpen; },
    get toolbarVisible() { return toolbarVisible; },
    get loading() { return loading; },
    get error() { return error; },
    get canvasZoom() { return canvasZoom; },
    get canvasPosition() { return canvasPosition; },
    get showGrid() { return showGrid; },
    get snapToGrid() { return snapToGrid; },
    get gridSize() { return gridSize; },
    get showChunkCreator() { return showChunkCreator; },
    get showKeyframeInserter() { return showKeyframeInserter; },
    get showExportDialog() { return showExportDialog; },
    get showSettingsDialog() { return showSettingsDialog; },
    get showConnectionValidator() { return showConnectionValidator; },
    get selectedItems() { return selectedItems; },
    get draggedItem() { return draggedItem; },
    get hoveredItem() { return hoveredItem; },
    get contextMenuOpen() { return contextMenuOpen; },
    get contextMenuPosition() { return contextMenuPosition; },
    get keyboardShortcutsEnabled() { return keyboardShortcutsEnabled; },
    get theme() { return theme; },
    get compactMode() { return compactMode; },

    // Derived getters
    get isCanvasView() { return isCanvasView; },
    get isPresentationView() { return isPresentationView; },
    get isSetView() { return isSetView; },
    get hasSelection() { return hasSelection; },
    get multipleSelection() { return multipleSelection; },
    get canZoomIn() { return canZoomIn; },
    get canZoomOut() { return canZoomOut; },

    // Methods
    switchView,
    toggleSidebar,
    toggleToolbar,
    setLoading,
    setError,
    clearError,
    setCanvasZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setCanvasPosition,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize,
    openChunkCreator,
    closeChunkCreator,
    openKeyframeInserter,
    closeKeyframeInserter,
    openExportDialog,
    closeExportDialog,
    openSettingsDialog,
    closeSettingsDialog,
    openConnectionValidator,
    closeConnectionValidator,
    selectItems,
    deselectItems,
    clearSelection,
    isSelected,
    setDraggedItem,
    setHoveredItem,
    showContextMenu,
    closeContextMenu,
    toggleTheme,
    setTheme,
    toggleCompactMode,
    reset
  };
}

// Create and export the store instance
export const uiStore = createUIStore();
