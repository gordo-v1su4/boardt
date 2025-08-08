<!--
  ExportControls.svelte - PDF/presentation export controls
  Task 9: Presentation Designer - PDF export functionality
-->
<script>
  import { createEventDispatcher } from 'svelte';
  import { presentationModeStore } from '../../stores/presentationMode.svelte.js';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import { uiStore } from '../../stores/ui.svelte.js';

  const dispatch = createEventDispatcher();

  // Export settings
  let exportFormat = 'pdf';
  let exportQuality = 'high';
  let includeNotes = true;
  let includeMetadata = true;
  let includeConnections = true;
  let pageOrientation = 'landscape';
  let slidesPerPage = 1;
  let customTitle = '';
  let isExporting = false;
  let exportProgress = 0;

  // Reactive state
  $: chunks = storyChunksStore.chunks;
  $: connections = storyChunksStore.connections;
  $: showDialog = uiStore.showExportDialog;

  /**
   * Start export process
   */
  async function startExport() {
    if (chunks.length === 0) return;

    isExporting = true;
    exportProgress = 0;

    try {
      // Generate presentation data
      const presentationData = {
        title: customTitle || presentationModeStore.presentationTitle,
        chunks,
        connections: includeConnections ? connections : [],
        settings: {
          exportFormat,
          exportQuality,
          includeNotes,
          includeMetadata,
          pageOrientation,
          slidesPerPage
        }
      };

      // Simulate export progress
      const progressSteps = [
        { step: 'Preparing data...', progress: 20 },
        { step: 'Generating slides...', progress: 40 },
        { step: 'Processing images...', progress: 60 },
        { step: 'Creating document...', progress: 80 },
        { step: 'Finalizing export...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        exportProgress = progress;
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // In a real implementation, this would call an export service
      await mockExport(presentationData);

      // Success
      dispatch('exportComplete', { format: exportFormat });
      close();
    } catch (error) {
      console.error('Export failed:', error);
      // Handle error
    } finally {
      isExporting = false;
      exportProgress = 0;
    }
  }

  /**
   * Mock export function (placeholder for real implementation)
   */
  async function mockExport(data) {
    // This would integrate with a PDF generation library like jsPDF or Puppeteer
    console.log('Exporting presentation:', data);
    
    // Create a simple HTML representation for now
    const htmlContent = generateHTMLExport(data);
    
    // Create and download a file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate HTML export
   */
  function generateHTMLExport(data) {
    const { title, chunks, connections, settings } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .chunk { margin-bottom: 40px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px; }
        .chunk-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 10px; }
        .chunk-description { color: #6b7280; margin-bottom: 20px; }
        .images { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .image { border-radius: 8px; overflow: hidden; }
        .image img { width: 100%; height: 150px; object-fit: cover; }
        .image-caption { padding: 8px; font-size: 0.9rem; color: #6b7280; }
        ${settings.includeMetadata ? '.metadata { margin-top: 20px; font-size: 0.8rem; color: #9ca3af; }' : ''}
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>${chunks.length} chunks • ${connections.length} connections</p>
    </div>
    
    ${chunks.map((chunk, index) => `
        <div class="chunk">
            <div class="chunk-title">${index + 1}. ${chunk.title}</div>
            ${chunk.description ? `<div class="chunk-description">${chunk.description}</div>` : ''}
            
            ${chunk.images.length > 0 ? `
                <div class="images">
                    ${chunk.images.map(image => `
                        <div class="image">
                            <img src="${image.url}" alt="${image.prompt}" />
                            <div class="image-caption">${image.prompt}</div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>No images in this chunk</p>'}
            
            ${settings.includeMetadata ? `
                <div class="metadata">
                    <p>Type: ${chunk.chunkType} | Created: ${new Date(chunk.createdAt).toLocaleDateString()}</p>
                </div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;
  }

  /**
   * Close export dialog
   */
  function close() {
    uiStore.closeExportDialog();
    reset();
  }

  /**
   * Reset form
   */
  function reset() {
    exportFormat = 'pdf';
    exportQuality = 'high';
    includeNotes = true;
    includeMetadata = true;
    includeConnections = true;
    pageOrientation = 'landscape';
    slidesPerPage = 1;
    customTitle = '';
    isExporting = false;
    exportProgress = 0;
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(event) {
    if (event.key === 'Escape' && !isExporting) {
      close();
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !isExporting) {
      startExport();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showDialog}
  <div
    class="modal-overlay"
    onclick={(e) => { if (e.target === e.currentTarget) close(); }}
    onkeydown={(e) => { if (e.key === 'Escape') close(); }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="export-dialog">
      <div class="dialog-header">
        <h2>Export Storyboard</h2>
        {#if !isExporting}
          <button class="close-btn" onclick={close} title="Close">×</button>
        {/if}
      </div>

      <div class="dialog-content">
        {#if isExporting}
          <!-- Export Progress -->
          <div class="export-progress">
            <div class="progress-header">
              <h3>Exporting your storyboard...</h3>
              <span>{exportProgress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {exportProgress}%"></div>
            </div>
            <p class="progress-note">Please wait while we prepare your export.</p>
          </div>
        {:else}
          <!-- Export Settings -->
          <div class="export-settings">
            <!-- Basic Settings -->
            <div class="settings-section">
              <h3>Export Settings</h3>
              
              <div class="form-group">
                <label for="export-format">Format</label>
                <select id="export-format" bind:value={exportFormat}>
                  <option value="pdf">PDF Document</option>
                  <option value="html">HTML Page</option>
                  <option value="pptx">PowerPoint (Coming Soon)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="custom-title">Title (optional)</label>
                <input
                  id="custom-title"
                  type="text"
                  bind:value={customTitle}
                  placeholder="Custom presentation title..."
                  maxlength="100"
                />
              </div>

              <div class="form-group">
                <label for="export-quality">Quality</label>
                <select id="export-quality" bind:value={exportQuality}>
                  <option value="low">Low - Faster export</option>
                  <option value="medium">Medium - Balanced</option>
                  <option value="high">High - Best quality</option>
                </select>
              </div>
            </div>

            <!-- Layout Settings -->
            <div class="settings-section">
              <h3>Layout</h3>
              
              <div class="form-group">
                <label for="page-orientation">Page Orientation</label>
                <select id="page-orientation" bind:value={pageOrientation}>
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>

              <div class="form-group">
                <label for="slides-per-page">Chunks per Page</label>
                <select id="slides-per-page" bind:value={slidesPerPage}>
                  <option value={1}>1 chunk per page</option>
                  <option value={2}>2 chunks per page</option>
                  <option value={4}>4 chunks per page</option>
                </select>
              </div>
            </div>

            <!-- Content Settings -->
            <div class="settings-section">
              <h3>Content</h3>
              
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={includeMetadata} />
                  <span>Include metadata (dates, IDs, etc.)</span>
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={includeConnections} />
                  <span>Include connection information</span>
                </label>
                
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={includeNotes} />
                  <span>Include notes and descriptions</span>
                </label>
              </div>
            </div>

            <!-- Preview Info -->
            <div class="export-preview">
              <h3>Export Preview</h3>
              <div class="preview-stats">
                <div class="stat-item">
                  <span class="stat-number">{chunks.length}</span>
                  <span class="stat-label">chunks</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{chunks.reduce((sum, chunk) => sum + chunk.images.length, 0)}</span>
                  <span class="stat-label">images</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{connections.length}</span>
                  <span class="stat-label">connections</span>
                </div>
              </div>
              <p class="preview-note">
                Estimated file size: ~{Math.ceil(chunks.length * 0.5)}MB
              </p>
            </div>
          </div>
        {/if}
      </div>

      {#if !isExporting}
        <div class="dialog-footer">
          <div class="footer-info">
            {#if chunks.length === 0}
              <span class="warning-text">No chunks to export</span>
            {:else}
              <span class="info-text">Ready to export {chunks.length} chunks</span>
            {/if}
          </div>

          <div class="footer-actions">
            <button class="btn secondary" onclick={close}>Cancel</button>
            <button
              class="btn primary"
              onclick={startExport}
              disabled={chunks.length === 0}
            >
              📤 Export {exportFormat.toUpperCase()}
            </button>
          </div>
        </div>
      {/if}
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

  .export-dialog {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h2 {
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

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .export-progress {
    text-align: center;
    padding: 40px 20px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .progress-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #1f2937;
  }

  .progress-bar {
    background: #e5e7eb;
    border-radius: 8px;
    height: 12px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .progress-fill {
    background: #3b82f6;
    height: 100%;
    transition: width 0.3s ease;
  }

  .progress-note {
    color: #6b7280;
    font-size: 14px;
  }

  .export-settings {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .settings-section h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;
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
  .form-group select {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
  }

  .export-preview {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
  }

  .export-preview h3 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .preview-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
  }

  .preview-note {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
  }

  .dialog-footer {
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
    display: flex;
    align-items: center;
    gap: 6px;
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

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
