<!--
  StoryFlowDiagram.svelte - Narrative tree visualization
  Task 9: Presentation Designer - StoryFlowDiagram for narrative tree visualization
-->
<script>
  export let chunks = [];
  export let connections = [];
  export let compact = false;

  // Calculate layout positions for chunks
  function calculateLayout() {
    if (chunks.length === 0) return { nodes: [], edges: [] };

    // Simple hierarchical layout
    const nodes = chunks.map((chunk, index) => {
      // Find root chunks (no incoming connections)
      const hasIncoming = connections.some(conn => conn.targetChunkId === chunk.id);
      
      // Calculate position based on index and hierarchy
      const x = hasIncoming ? 200 + (index % 3) * 150 : 50;
      const y = 50 + Math.floor(index / 3) * 120;

      return {
        id: chunk.id,
        title: chunk.title,
        type: chunk.chunkType,
        x,
        y,
        width: compact ? 120 : 140,
        height: compact ? 60 : 80
      };
    });

    const edges = connections.map(conn => {
      const source = nodes.find(n => n.id === conn.sourceChunkId);
      const target = nodes.find(n => n.id === conn.targetChunkId);
      
      if (!source || !target) return null;

      return {
        id: conn.id,
        source: conn.sourceChunkId,
        target: conn.targetChunkId,
        type: conn.connectionType,
        label: conn.label,
        sourceX: source.x + source.width,
        sourceY: source.y + source.height / 2,
        targetX: target.x,
        targetY: target.y + target.height / 2
      };
    }).filter(Boolean);

    return { nodes, edges };
  }

  $: layout = calculateLayout();
  $: viewBox = calculateViewBox(layout.nodes);

  function calculateViewBox(nodes) {
    if (nodes.length === 0) return '0 0 400 300';
    
    const minX = Math.min(...nodes.map(n => n.x)) - 20;
    const maxX = Math.max(...nodes.map(n => n.x + n.width)) + 20;
    const minY = Math.min(...nodes.map(n => n.y)) - 20;
    const maxY = Math.max(...nodes.map(n => n.y + n.height)) + 20;
    
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }

  function getNodeColor(type) {
    const colors = {
      sequence: '#3b82f6',
      choice: '#f59e0b',
      keyframe: '#10b981'
    };
    return colors[type] || colors.sequence;
  }

  function getEdgeColor(type) {
    const colors = {
      sequence: '#3b82f6',
      choice: '#f59e0b',
      branch: '#10b981'
    };
    return colors[type] || colors.sequence;
  }

  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }
</script>

<div class="story-flow-diagram" class:compact>
  {#if chunks.length === 0}
    <div class="empty-diagram">
      <div class="empty-icon">🌊</div>
      <p>No story flow to display</p>
    </div>
  {:else}
    <svg class="flow-svg" {viewBox} preserveAspectRatio="xMidYMid meet">
      <!-- Define arrow markers -->
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
        
        <marker
          id="arrowhead-choice"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
        
        <marker
          id="arrowhead-branch"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
      </defs>

      <!-- Render edges first (behind nodes) -->
      {#each layout.edges as edge}
        <g class="edge-group">
          <!-- Edge line -->
          <line
            x1={edge.sourceX}
            y1={edge.sourceY}
            x2={edge.targetX}
            y2={edge.targetY}
            stroke={getEdgeColor(edge.type)}
            stroke-width="2"
            marker-end="url(#arrowhead{edge.type === 'choice' ? '-choice' : edge.type === 'branch' ? '-branch' : ''})"
            class="connection-line"
          />
          
          <!-- Edge label -->
          {#if edge.label && !compact}
            <text
              x={(edge.sourceX + edge.targetX) / 2}
              y={(edge.sourceY + edge.targetY) / 2 - 5}
              text-anchor="middle"
              class="edge-label"
              fill="#6b7280"
              font-size="10"
            >
              {truncateText(edge.label, 15)}
            </text>
          {/if}
        </g>
      {/each}

      <!-- Render nodes -->
      {#each layout.nodes as node}
        <g class="node-group" transform="translate({node.x}, {node.y})">
          <!-- Node background -->
          <rect
            width={node.width}
            height={node.height}
            rx="8"
            fill="white"
            stroke={getNodeColor(node.type)}
            stroke-width="2"
            class="node-rect"
          />
          
          <!-- Node title -->
          <text
            x={node.width / 2}
            y={compact ? node.height / 2 + 2 : node.height / 2 - 5}
            text-anchor="middle"
            class="node-title"
            fill="#1f2937"
            font-size={compact ? "10" : "12"}
            font-weight="600"
          >
            {truncateText(node.title, compact ? 12 : 16)}
          </text>
          
          <!-- Node type -->
          {#if !compact}
            <text
              x={node.width / 2}
              y={node.height / 2 + 12}
              text-anchor="middle"
              class="node-type"
              fill={getNodeColor(node.type)}
              font-size="9"
              font-weight="500"
            >
              {node.type}
            </text>
          {/if}
        </g>
      {/each}
    </svg>

    <!-- Legend -->
    {#if !compact}
      <div class="diagram-legend">
        <div class="legend-title">Legend</div>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color" style="background: #3b82f6;"></div>
            <span>Sequence</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #f59e0b;"></div>
            <span>Choice</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #10b981;"></div>
            <span>Keyframe</span>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .story-flow-diagram {
    width: 100%;
    height: 100%;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .story-flow-diagram.compact {
    height: 300px;
  }

  .empty-diagram {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6b7280;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-diagram p {
    margin: 0;
    font-size: 1rem;
  }

  .flow-svg {
    width: 100%;
    height: 100%;
    background: white;
  }

  .node-group {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .node-group:hover .node-rect {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
    transform: scale(1.02);
  }

  .node-rect {
    transition: all 0.2s ease;
  }

  .node-title {
    pointer-events: none;
    user-select: none;
  }

  .node-type {
    pointer-events: none;
    user-select: none;
    text-transform: capitalize;
  }

  .edge-group {
    pointer-events: none;
  }

  .connection-line {
    transition: all 0.2s ease;
  }

  .connection-line:hover {
    stroke-width: 3;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2));
  }

  .edge-label {
    pointer-events: none;
    user-select: none;
    font-weight: 500;
  }

  .diagram-legend {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 8px 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .legend-title {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .legend-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #6b7280;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .story-flow-diagram {
      height: 250px;
    }

    .diagram-legend {
      bottom: 8px;
      left: 8px;
      padding: 6px 8px;
    }

    .legend-title {
      font-size: 10px;
    }

    .legend-item {
      font-size: 10px;
    }

    .legend-color {
      width: 10px;
      height: 10px;
    }
  }

  /* Animation for new elements */
  .node-group {
    animation: nodeAppear 0.5s ease-out;
  }

  .edge-group {
    animation: edgeAppear 0.7s ease-out;
  }

  @keyframes nodeAppear {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes edgeAppear {
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
</style>
