<!--
  ConnectionEdge.svelte - Custom SvelteFlow edge for story connections with Svelte 5 + Runes
  Task 7: Canvas Flow Architect - ConnectionEdge for visual story flow connections
-->
<script>
  import { getBezierPath } from '@xyflow/svelte';
  import { uiStore } from '../../stores/ui.svelte.js';
  import { storyChunksStore } from '../../stores/storyChunks.svelte.js';

  // Props from SvelteFlow - modern Svelte 5 syntax
  let { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected = false } = $props();

  // Extract connection data using derived state
  let connection = $derived(data?.connection);
  let connectionType = $derived(connection?.connectionType || 'sequence');
  let label = $derived(connection?.label || '');
  let isSelected = $derived(selected || uiStore.isSelected(id));

  // Calculate bezier path using derived state
  let pathData = $derived(getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  }));
  
  let edgePath = $derived(pathData[0]);
  let labelX = $derived(pathData[1]);
  let labelY = $derived(pathData[2]);

  /**
   * Get edge style based on connection type
   */
  function getEdgeStyle(type) {
    const styles = {
      sequence: {
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: 'none'
      },
      choice: {
        stroke: '#f59e0b',
        strokeWidth: 3,
        strokeDasharray: '8,4'
      },
      branch: {
        stroke: '#10b981',
        strokeWidth: 2,
        strokeDasharray: '4,4'
      }
    };
    return styles[type] || styles.sequence;
  }

  /**
   * Get connection type icon
   */
  function getConnectionIcon(type) {
    const icons = {
      sequence: '→',
      choice: '⚡',
      branch: '🌿'
    };
    return icons[type] || icons.sequence;
  }

  /**
   * Handle edge selection
   */
  function handleSelect() {
    uiStore.selectItems(id);
  }

  /**
   * Handle edge deletion
   */
  function handleDelete(event) {
    event.stopPropagation();
    storyChunksStore.removeConnection(id);
  }

  /**
   * Handle context menu
   */
  function handleContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    uiStore.showContextMenu({ x: event.clientX, y: event.clientY });
    uiStore.selectItems(id);
  }

  // Use derived for edge style - modern Svelte 5 syntax
  let edgeStyle = $derived(getEdgeStyle(connectionType));
</script>

<!-- Main edge path -->
<path
  id={id}
  class="connection-edge"
  class:selected={isSelected}
  d={edgePath}
  stroke={edgeStyle.stroke}
  stroke-width={edgeStyle.strokeWidth}
  stroke-dasharray={edgeStyle.strokeDasharray}
  fill="none"
  marker-end="url(#arrowhead-{connectionType})"
  onclick={handleSelect}
  oncontextmenu={handleContextMenu}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); } }}
  role="button"
  tabindex="0"
/>

<!-- Edge label -->
{#if label || isSelected}
  <div
    class="edge-label"
    class:selected={isSelected}
    style="transform: translate(-50%, -50%) translate({labelX}px, {labelY}px)"
    onclick={handleSelect}
    oncontextmenu={handleContextMenu}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); } }}
    role="button"
    tabindex="0"
  >
    <div class="label-content">
      <span class="connection-icon">{getConnectionIcon(connectionType)}</span>
      {#if label}
        <span class="label-text">{label}</span>
      {/if}
      {#if isSelected}
        <button
          class="delete-btn"
          onclick={handleDelete}
          title="Delete connection"
          aria-label="Delete connection"
        >
          ×
        </button>
      {/if}
    </div>
  </div>
{/if}

<!-- Arrow markers for different connection types -->
<svelte:head>
  <style>
    /* Define arrow markers in SVG defs */
  </style>
</svelte:head>

<svg style="position: absolute; top: 0; left: 0; width: 0; height: 0;">
  <defs>
    <!-- Sequence arrow -->
    <marker
      id="arrowhead-sequence"
      markerWidth="10"
      markerHeight="7"
      refX="9"
      refY="3.5"
      orient="auto"
    >
      <polygon
        points="0 0, 10 3.5, 0 7"
        fill="#3b82f6"
      />
    </marker>

    <!-- Choice arrow -->
    <marker
      id="arrowhead-choice"
      markerWidth="12"
      markerHeight="8"
      refX="11"
      refY="4"
      orient="auto"
    >
      <polygon
        points="0 0, 12 4, 0 8"
        fill="#f59e0b"
      />
    </marker>

    <!-- Branch arrow -->
    <marker
      id="arrowhead-branch"
      markerWidth="10"
      markerHeight="7"
      refX="9"
      refY="3.5"
      orient="auto"
    >
      <polygon
        points="0 0, 10 3.5, 0 7"
        fill="#10b981"
      />
    </marker>
  </defs>
</svg>

<style>
  .connection-edge {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .connection-edge:hover {
    stroke-width: 4;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .connection-edge.selected {
    stroke-width: 4;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
  }

  .edge-label {
    position: absolute;
    pointer-events: all;
    cursor: pointer;
    z-index: 1000;
  }

  .label-content {
    display: flex;
    align-items: center;
    gap: 4px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .edge-label:hover .label-content {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }

  .edge-label.selected .label-content {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .connection-icon {
    font-size: 14px;
    line-height: 1;
  }

  .label-text {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .delete-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: 4px;
  }

  .delete-btn:hover {
    background: #dc2626;
    transform: scale(1.1);
  }

  /* Animation for new connections */
  @keyframes connectionAppear {
    from {
      opacity: 0;
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
    }
    to {
      opacity: 1;
      stroke-dashoffset: 0;
    }
  }

  .connection-edge {
    animation: connectionAppear 0.5s ease-out;
  }

  /* Different styles for connection types */
  .connection-edge[stroke="#f59e0b"] {
    /* Choice connections have a pulsing effect */
    animation: connectionAppear 0.5s ease-out, pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .connection-edge[stroke="#10b981"] {
    /* Branch connections have a flowing effect */
    stroke-dasharray: 8, 4;
    animation: connectionAppear 0.5s ease-out, flow 3s linear infinite;
  }

  @keyframes flow {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: 12;
    }
  }
</style>
