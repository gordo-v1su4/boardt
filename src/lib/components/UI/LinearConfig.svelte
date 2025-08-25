<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { linearConfig } from '$lib/stores/linearConfig.svelte.js';
  import { LinearService } from '$lib/mcp/linear/linearService';
  import type { LinearTeam, LinearProject } from '$lib/mcp/linear/types';

  // Component state
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  
  // Linear data
  let teams = $state<LinearTeam[]>([]);
  let projects = $state<LinearProject[]>([]);
  
  // Form values
  let enabled = $state($linearConfig.enabled);
  let teamId = $state($linearConfig.teamId);
  let projectId = $state($linearConfig.projectId);
  let autoSync = $state($linearConfig.autoSync);
  let syncInterval = $state($linearConfig.syncInterval / 60000); // Convert ms to minutes for UI

  // Cleanup timeout
  let messageTimeout: ReturnType<typeof setTimeout> | null = null;

  // Load teams and projects when component mounts
  onMount(async () => {
    loadTeams();
    
    if (teamId) {
      loadProjects(teamId);
    }
  });
  
  // Clean up on unmount
  onDestroy(() => {
    if (messageTimeout) clearTimeout(messageTimeout);
  });

  // Load teams from Linear
  async function loadTeams() {
    loading = true;
    error = null;
    
    try {
      teams = await LinearService.listTeams();
    } catch (err) {
      error = 'Failed to load teams. Please check your Linear MCP configuration.';
    } finally {
      loading = false;
    }
  }
  
  // Load projects for the selected team
  async function loadProjects(selectedTeamId: string) {
    if (!selectedTeamId) return;
    
    loading = true;
    error = null;
    
    try {
      projects = await LinearService.listProjects({ teamId: selectedTeamId });
    } catch (err) {
      error = 'Failed to load projects.';
    } finally {
      loading = false;
    }
  }
  
  // Handle team selection change
  function handleTeamChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    teamId = select.value;
    projectId = ''; // Reset project when team changes
    loadProjects(teamId);
  }
  
  // Handle project selection change
  function handleProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    projectId = select.value;
  }
  
  // Handle sync interval change
  function handleSyncIntervalChange(event: Event) {
    const input = event.target as HTMLInputElement;
    syncInterval = Number(input.value);
  }
  
  // Save configuration
  function saveConfig() {
    // Update config in store
    linearConfig.setEnabled(enabled);
    linearConfig.setTeamId(teamId);
    linearConfig.setProjectId(projectId);
    linearConfig.setSyncInterval(syncInterval * 60000); // Convert minutes to ms
    linearConfig.setAutoSync(autoSync);
    
    // Show success message
    success = 'Configuration saved successfully!';
    
    // Clear success message after 3 seconds
    messageTimeout = setTimeout(() => {
      success = null;
    }, 3000);
  }
  
  // Reset configuration
  function resetConfig() {
    linearConfig.reset();
    
    // Update local state
    enabled = false;
    teamId = '';
    projectId = '';
    autoSync = false;
    syncInterval = 1;
    
    success = 'Configuration reset successfully!';
    messageTimeout = setTimeout(() => {
      success = null;
    }, 3000);
  }
  
  // Test connection
  async function testConnection() {
    if (!teamId) {
      error = 'Please select a team first';
      return;
    }
    
    loading = true;
    error = null;
    
    try {
      // Just try to list workflow states as a simple test
      await LinearService.listWorkflowStates({ teamId });
      success = 'Connection successful! Linear MCP server is working correctly.';
      messageTimeout = setTimeout(() => {
        success = null;
      }, 3000);
    } catch (err) {
      error = 'Connection failed. Please check your Linear MCP server configuration.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="linear-config">
  <h2 class="title">Linear Integration</h2>
  
  {#if error}
    <div class="alert error">
      <span class="icon">⚠️</span>
      <span class="message">{error}</span>
    </div>
  {/if}
  
  {#if success}
    <div class="alert success">
      <span class="icon">✓</span>
      <span class="message">{success}</span>
    </div>
  {/if}
  
  <div class="form-group">
    <div class="checkbox-wrapper">
      <input 
        type="checkbox" 
        id="enabled" 
        bind:checked={enabled}
      />
      <label for="enabled">Enable Linear Integration</label>
    </div>
    <small class="helper-text">
      When enabled, Boardt will sync with Linear through the Linear MCP server.
    </small>
  </div>
  
  <div class="form-group">
    <label for="team-select">Select Team</label>
    {#if loading && teams.length === 0}
      <div class="loading">Loading teams...</div>
    {:else if teams.length === 0}
      <div class="empty">
        No teams found. Please check your Linear MCP server configuration.
      </div>
    {:else}
      <select 
        id="team-select" 
        value={teamId}
        on:change={handleTeamChange}
        disabled={loading}
      >
        <option value="">Select a team...</option>
        {#each teams as team}
          <option value={team.id}>{team.name}</option>
        {/each}
      </select>
    {/if}
  </div>
  
  {#if teamId}
    <div class="form-group">
      <label for="project-select">Select Project (Optional)</label>
      {#if loading && projects.length === 0}
        <div class="loading">Loading projects...</div>
      {:else if projects.length === 0}
        <div class="empty">No projects found for this team.</div>
      {:else}
        <select 
          id="project-select" 
          value={projectId}
          on:change={handleProjectChange}
          disabled={loading}
        >
          <option value="">No specific project</option>
          {#each projects as project}
            <option value={project.id}>{project.name}</option>
          {/each}
        </select>
      {/if}
      <small class="helper-text">
        If selected, new issues will be created in this project.
      </small>
    </div>
  {/if}
  
  <div class="form-group">
    <div class="checkbox-wrapper">
      <input 
        type="checkbox" 
        id="auto-sync" 
        bind:checked={autoSync}
        disabled={!enabled}
      />
      <label for="auto-sync">Enable Auto-Synchronization</label>
    </div>
    <small class="helper-text">
      Automatically sync with Linear at regular intervals.
    </small>
  </div>
  
  {#if autoSync}
    <div class="form-group">
      <label for="sync-interval">Sync Interval (minutes)</label>
      <input 
        type="number" 
        id="sync-interval" 
        min="1" 
        max="60"
        bind:value={syncInterval}
        on:change={handleSyncIntervalChange}
        disabled={!autoSync}
      />
      <small class="helper-text">
        How often Boardt should check for updates from Linear.
      </small>
    </div>
  {/if}
  
  <div class="button-row">
    <button 
      class="btn primary" 
      on:click={saveConfig}
      disabled={loading}
    >
      Save Configuration
    </button>
    
    <button 
      class="btn secondary" 
      on:click={testConnection}
      disabled={loading || !teamId}
    >
      Test Connection
    </button>
    
    <button 
      class="btn danger" 
      on:click={resetConfig}
      disabled={loading}
    >
      Reset
    </button>
  </div>
</div>

<style>
  .linear-config {
    background: #1c1917;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    color: #e4e4e7;
  }
  
  .title {
    color: #fafaf9;
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #e4e4e7;
    font-weight: 500;
  }
  
  select, input[type="number"] {
    width: 100%;
    padding: 10px;
    background: #292524;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    color: #fafaf9;
    font-size: 14px;
  }
  
  select:focus, input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  
  .checkbox-wrapper input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #3b82f6;
  }
  
  .helper-text {
    display: block;
    color: #a1a1aa;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .alert {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .error {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid #ef4444;
  }
  
  .success {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid #22c55e;
  }
  
  .loading, .empty {
    padding: 10px;
    color: #a1a1aa;
    font-size: 14px;
    background: #292524;
    border-radius: 6px;
  }
  
  .button-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .primary {
    background: #3b82f6;
    color: white;
  }
  
  .primary:hover:not(:disabled) {
    background: #2563eb;
  }
  
  .secondary {
    background: #4b5563;
    color: white;
  }
  
  .secondary:hover:not(:disabled) {
    background: #6b7280;
  }
  
  .danger {
    background: #ef4444;
    color: white;
  }
  
  .danger:hover:not(:disabled) {
    background: #dc2626;
  }
</style>