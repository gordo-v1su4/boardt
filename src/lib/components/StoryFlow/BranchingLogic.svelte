<!--
  BranchingLogic.svelte - Choose-your-own-adventure branching logic
  Task 10: Connection Specialist - BranchingLogic for conditional story paths
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';
  import type { StoryChunk, StoryConnection } from '../../types/storyboard.js';

  const dispatch = createEventDispatcher();

  export let chunk: StoryChunk;
  export let connections: StoryConnection[] = [];
  export let editable = true;

  // Component state
  let showBranchEditor = false;
  let newBranchLabel = '';
  let newBranchCondition = '';

  // Reactive state
  $: outgoingConnections = connections.filter(conn => conn.sourceChunkId === chunk.id);
  $: choiceConnections = outgoingConnections.filter(conn => conn.connectionType === 'choice');
  $: branchConnections = outgoingConnections.filter(conn => conn.connectionType === 'branch');
  $: hasChoices = choiceConnections.length > 0;
  $: hasBranches = branchConnections.length > 0;
  $: isChoiceChunk = chunk.chunkType === 'choice';

  /**
   * Add new branch connection
   */
  function addBranch() {
    if (!newBranchLabel.trim()) return;

    const newConnection = storyChunksStore.addConnection({
      sourceChunkId: chunk.id,
      targetChunkId: '', // Will be set when target is selected
      connectionType: 'choice',
      label: newBranchLabel.trim(),
      condition: newBranchCondition.trim() || null
    });

    // Reset form
    newBranchLabel = '';
    newBranchCondition = '';
    showBranchEditor = false;

    dispatch('branchAdded', { connection: newConnection });
  }

  /**
   * Remove branch connection
   */
  function removeBranch(connectionId: string) {
    storyChunksStore.removeConnection(connectionId);
    dispatch('branchRemoved', { connectionId });
  }

  /**
   * Update branch label
   */
  function updateBranchLabel(connectionId: string, newLabel: string) {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      connection.label = newLabel;
      dispatch('branchUpdated', { connectionId, label: newLabel });
    }
  }

  /**
   * Update branch condition
   */
  function updateBranchCondition(connectionId: string, newCondition: string) {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      connection.condition = newCondition || null;
      dispatch('branchUpdated', { connectionId, condition: newCondition });
    }
  }

  /**
   * Convert chunk to choice type
   */
  function convertToChoiceChunk() {
    storyChunksStore.updateChunk(chunk.id, { chunkType: 'choice' });
    dispatch('chunkTypeChanged', { chunkId: chunk.id, newType: 'choice' });
  }

  /**
   * Get branch validation status
   */
  function validateBranch(connection: StoryConnection) {
    const errors = [];
    
    if (!connection.label || connection.label.trim() === '') {
      errors.push('Branch needs a label');
    }
    
    if (!connection.targetChunkId) {
      errors.push('Branch needs a target chunk');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get suggested branch conditions
   */
  function getSuggestedConditions() {
    return [
      'User clicks "Yes"',
      'User clicks "No"',
      'Character has item',
      'Score > 50',
      'Time remaining',
      'Previous choice was A',
      'Random 50%'
    ];
  }
</script>

<div class="branching-logic" class:choice-chunk={isChoiceChunk}>
  <!-- Header -->
  <div class="logic-header">
    <div class="header-info">
      <h3>Story Branching</h3>
      <div class="branch-stats">
        {#if hasChoices}
          <span class="stat-item choice">
            🔀 {choiceConnections.length} choices
          </span>
        {/if}
        {#if hasBranches}
          <span class="stat-item branch">
            🌿 {branchConnections.length} branches
          </span>
        {/if}
        {#if !hasChoices && !hasBranches}
          <span class="stat-item none">No branches</span>
        {/if}
      </div>
    </div>

    {#if editable}
      <div class="header-actions">
        {#if !isChoiceChunk}
          <button
            class="action-btn convert"
            on:click={convertToChoiceChunk}
            title="Convert to choice chunk"
          >
            🔀 Make Choice
          </button>
        {/if}
        
        <button
          class="action-btn add"
          on:click={() => showBranchEditor = !showBranchEditor}
          title="Add branch"
        >
          ➕ Add Branch
        </button>
      </div>
    {/if}
  </div>

  <!-- Branch Editor -->
  {#if showBranchEditor && editable}
    <div class="branch-editor">
      <div class="editor-header">
        <h4>Add New Branch</h4>
        <button
          class="close-btn"
          on:click={() => showBranchEditor = false}
          title="Close"
        >
          ×
        </button>
      </div>

      <div class="editor-form">
        <div class="form-group">
          <label for="branch-label">Branch Label *</label>
          <input
            id="branch-label"
            type="text"
            bind:value={newBranchLabel}
            placeholder="e.g., 'Choose Option A', 'Go Left'"
            maxlength="50"
          />
        </div>

        <div class="form-group">
          <label for="branch-condition">Condition (optional)</label>
          <input
            id="branch-condition"
            type="text"
            bind:value={newBranchCondition}
            placeholder="e.g., 'User clicks Yes', 'Score > 50'"
            maxlength="100"
          />
          
          <div class="condition-suggestions">
            <span class="suggestions-label">Suggestions:</span>
            {#each getSuggestedConditions().slice(0, 3) as suggestion}
              <button
                class="suggestion-btn"
                on:click={() => newBranchCondition = suggestion}
                type="button"
              >
                {suggestion}
              </button>
            {/each}
          </div>
        </div>

        <div class="editor-actions">
          <button
            class="btn secondary"
            on:click={() => showBranchEditor = false}
          >
            Cancel
          </button>
          <button
            class="btn primary"
            on:click={addBranch}
            disabled={!newBranchLabel.trim()}
          >
            Add Branch
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Existing Branches -->
  {#if choiceConnections.length > 0}
    <div class="branches-list">
      <div class="list-header">
        <h4>Choice Branches</h4>
        <span class="branch-count">{choiceConnections.length}</span>
      </div>

      {#each choiceConnections as connection, index}
        {@const validation = validateBranch(connection)}
        <div class="branch-item" class:invalid={!validation.isValid}>
          <div class="branch-number">{index + 1}</div>
          
          <div class="branch-content">
            <div class="branch-label-section">
              {#if editable}
                <input
                  type="text"
                  class="branch-label-input"
                  value={connection.label}
                  on:blur={(e) => updateBranchLabel(connection.id, e.target.value)}
                  placeholder="Branch label..."
                />
              {:else}
                <span class="branch-label">{connection.label}</span>
              {/if}
            </div>

            {#if connection.condition || editable}
              <div class="branch-condition-section">
                <span class="condition-label">Condition:</span>
                {#if editable}
                  <input
                    type="text"
                    class="branch-condition-input"
                    value={connection.condition || ''}
                    on:blur={(e) => updateBranchCondition(connection.id, e.target.value)}
                    placeholder="Optional condition..."
                  />
                {:else}
                  <span class="branch-condition">
                    {connection.condition || 'Always available'}
                  </span>
                {/if}
              </div>
            {/if}

            {#if !validation.isValid}
              <div class="validation-errors">
                {#each validation.errors as error}
                  <span class="error-message">⚠️ {error}</span>
                {/each}
              </div>
            {/if}
          </div>

          {#if editable}
            <div class="branch-actions">
              <button
                class="action-btn danger small"
                on:click={() => removeBranch(connection.id)}
                title="Remove branch"
              >
                🗑️
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Branch Flow Visualization -->
  {#if choiceConnections.length > 1}
    <div class="branch-flow">
      <div class="flow-header">
        <h4>Branch Flow</h4>
      </div>
      
      <div class="flow-diagram">
        <div class="source-node">
          <span class="node-title">{chunk.title}</span>
          <span class="node-type">Choice Point</span>
        </div>
        
        <div class="branches">
          {#each choiceConnections as connection, index}
            <div class="flow-branch">
              <div class="branch-line"></div>
              <div class="branch-label-flow">{connection.label}</div>
              <div class="target-placeholder">
                {connection.targetChunkId ? 'Connected' : 'Not connected'}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Help Text -->
  {#if !hasChoices && !hasBranches && editable}
    <div class="help-text">
      <div class="help-icon">💡</div>
      <div class="help-content">
        <p><strong>Create branching stories:</strong></p>
        <ul>
          <li>Convert this chunk to a "Choice" type to enable branching</li>
          <li>Add multiple branches for different story paths</li>
          <li>Set conditions to control when branches are available</li>
          <li>Connect branches to other chunks to build your story tree</li>
        </ul>
      </div>
    </div>
  {/if}
</div>

<style>
  .branching-logic {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .branching-logic.choice-chunk {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
  }

  .logic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .header-info h3 {
    margin: 0 0 4px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .branch-stats {
    display: flex;
    gap: 12px;
  }

  .stat-item {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
  }

  .stat-item.choice {
    background: #fef3c7;
    color: #92400e;
  }

  .stat-item.branch {
    background: #d1fae5;
    color: #065f46;
  }

  .stat-item.none {
    color: #6b7280;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn:hover {
    background: #e5e7eb;
  }

  .action-btn.convert {
    background: #fef3c7;
    border-color: #fcd34d;
    color: #92400e;
  }

  .action-btn.add {
    background: #dbeafe;
    border-color: #93c5fd;
    color: #1d4ed8;
  }

  .action-btn.danger {
    background: #fee2e2;
    border-color: #fecaca;
    color: #dc2626;
  }

  .action-btn.small {
    padding: 4px 8px;
    font-size: 11px;
  }

  .branch-editor {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .editor-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: #6b7280;
    cursor: pointer;
    padding: 2px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .editor-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }

  .form-group input {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 13px;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .condition-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  .suggestions-label {
    font-size: 11px;
    color: #6b7280;
    margin-right: 4px;
  }

  .suggestion-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 10px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .suggestion-btn:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .editor-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .btn {
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
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

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .branches-list {
    margin-bottom: 16px;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .list-header h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1f2937;
  }

  .branch-count {
    background: #f59e0b;
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
  }

  .branch-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .branch-item.invalid {
    border-color: #fca5a5;
    background: #fef2f2;
  }

  .branch-number {
    background: #f59e0b;
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
  }

  .branch-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .branch-label-input,
  .branch-condition-input {
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 13px;
    background: white;
  }

  .branch-label {
    font-weight: 500;
    color: #1f2937;
  }

  .branch-condition-section {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .condition-label {
    color: #6b7280;
    font-weight: 500;
  }

  .branch-condition {
    color: #374151;
    font-style: italic;
  }

  .validation-errors {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .error-message {
    font-size: 11px;
    color: #dc2626;
  }

  .branch-actions {
    display: flex;
    gap: 4px;
  }

  .help-text {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    font-size: 13px;
  }

  .help-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .help-content p {
    margin: 0 0 8px 0;
    font-weight: 500;
    color: #1f2937;
  }

  .help-content ul {
    margin: 0;
    padding-left: 16px;
    color: #374151;
  }

  .help-content li {
    margin-bottom: 4px;
  }
</style>
