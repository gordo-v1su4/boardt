# ChunkNode and ChunkEdge Components Documentation

This document provides detailed documentation for the custom node and edge components used in the Boardt canvas implementation with SvelteFlow.

## Table of Contents

1. [ChunkNode Component](#chunknode-component)
   - [Overview](#overview)
   - [Props and Data Structure](#props-and-data-structure)
   - [Styling and Appearance](#styling-and-appearance)
   - [Handles and Connections](#handles-and-connections)
   - [Event Handling](#event-handling)
   - [Implementation Details](#implementation-details)

2. [ChunkEdge Component](#chunkedge-component)
   - [Overview](#overview-1)
   - [Props and Data Structure](#props-and-data-structure-1)
   - [Path Calculation](#path-calculation)
   - [Styling and Appearance](#styling-and-appearance-1)
   - [Animations](#animations)
   - [Custom Markers](#custom-markers)
   - [Event Handling](#event-handling-1)
   - [Implementation Details](#implementation-details-1)

3. [Integration and Usage](#integration-and-usage)

---

## ChunkNode Component

### Overview

The `ChunkNode` component represents visual story elements in the Boardt canvas. It's a custom node type for SvelteFlow that displays various types of content blocks (sequence, choice, or keyframe) with different styling and behavior.

### Props and Data Structure

The component receives these props from SvelteFlow:

```typescript
{
  data: {               // Custom data object
    type: string;       // 'sequence', 'choice', or 'keyframe'
    title: string;      // Node title
    description: string; // Node description
    hasImage: boolean;  // Whether the node has an image
    metadata?: {        // Optional metadata
      duration?: string; // Duration (e.g., '5s')
      characters?: string; // Characters in the scene
      // Other metadata
    };
    tags?: string[];    // Array of tags
  };
  id: string;           // Unique node identifier
  selected: boolean;    // Whether the node is selected
  dragging: boolean;    // Whether the node is being dragged
}
```

### Styling and Appearance

The ChunkNode styling is dynamically determined based on the chunk type:

```typescript
function getChunkStyle(type) {
  switch(type) {
    case 'sequence':
      return {
        borderColor: '#22c55e',  /* Zinc green */
        shadowColor: 'rgba(34, 197, 94, 0.3)'
      };
    case 'choice':
      return {
        borderColor: '#f59e0b',  /* Zinc amber */
        shadowColor: 'rgba(245, 158, 11, 0.3)'
      };
    case 'keyframe':
      return {
        borderColor: '#06b6d4',  /* Zinc cyan */
        shadowColor: 'rgba(6, 182, 212, 0.3)'
      };
    default:
      return {
        borderColor: '#3f3f46',
        shadowColor: 'rgba(63, 63, 70, 0.3)'
      };
  }
}
```

Each node type also has a specific icon:

```typescript
function getTypeIcon(type) {
  switch(type) {
    case 'sequence': return '📺';
    case 'choice': return '🔀'; 
    case 'keyframe': return '🎯';
    default: return '📝';
  }
}
```

### Handles and Connections

The ChunkNode has input and output handles for creating connections:

```svelte
<!-- Input Handle -->
<Handle
  type="target"
  position={Position.Left}
  class="chunk-handle chunk-handle-left"
  style="background: {connectionColor};"
  id="target-handle"
/>

<!-- Output Handle -->
<Handle
  type="source"
  position={Position.Right}
  class="chunk-handle chunk-handle-right"
  style="background: {connectionColor};"
  id="source-handle"
/>
```

Handle styling:

```css
:global(.chunk-handle) {
  width: 18px !important;
  height: 18px !important;
  border: 3px solid #292524 !important;
  border-radius: 50% !important;
  transition: all 0.2s !important;
  cursor: crosshair !important;
  z-index: 100 !important;
}

:global(.chunk-handle:hover) {
  width: 22px !important;
  height: 22px !important;
  border-width: 4px !important;
  box-shadow: 0 0 10px currentColor !important;
}
```

### Event Handling

The ChunkNode handles several events:

```typescript
// Handle node interactions
function handleNodeClick(event) {
  // Prevent default to avoid SvelteFlow selection issues
  event.stopPropagation();
}

function handleNodeDoubleClick(event) {
  event.stopPropagation();
  // Could trigger edit mode here
  console.log('Edit chunk:', id);
}

function handleContextMenu(event) {
  event.preventDefault();
  // Could show context menu here
  console.log('Context menu for chunk:', id);
}
```

### Implementation Details

The ChunkNode is structured with several sections:

1. **Header**: Shows the chunk type and icon
2. **Content**: Displays title, description, and image placeholder
3. **Metadata**: Shows duration, characters, etc.
4. **Footer**: Displays tags
5. **Handles**: Connection points on left and right sides

```svelte
<div class="chunk-node" class:selected class:dragging>
  <!-- Header -->
  <div class="chunk-header">
    <div class="chunk-type">
      <span class="type-icon">{typeIcon}</span>
      <span class="type-label">{data?.type || 'chunk'}</span>
    </div>
    
    {#if selected}
      <div class="selection-indicator">✓</div>
    {/if}
  </div>
  
  <!-- Content -->
  <div class="chunk-content">
    <div class="chunk-title">
      {data?.title || 'Untitled Chunk'}
    </div>
    
    {#if data?.description}
      <div class="chunk-description">
        {data.description}
      </div>
    {/if}

    {#if data?.hasImage}
      <div class="chunk-image-placeholder">
        <div class="image-icon">🖼️</div>
        <div class="image-text">AI Generated Image</div>
      </div>
    {/if}
    
    <!-- Metadata -->
    {#if data?.metadata}
      <div class="chunk-metadata">
        <!-- Metadata content -->
      </div>
    {/if}
  </div>
  
  <!-- Footer with tags -->
  {#if data?.tags && data.tags.length > 0}
    <div class="chunk-footer">
      <!-- Tags content -->
    </div>
  {/if}
</div>
```

The component is responsive and adjusts its layout for different screen sizes.

---

## ChunkEdge Component

### Overview

The `ChunkEdge` component represents connections between nodes in the Boardt canvas. It's a custom edge type for SvelteFlow that visualizes the relationships between story chunks with different styling based on the connection type.

### Props and Data Structure

The component receives these props from SvelteFlow:

```typescript
{
  id: string;                // Unique edge identifier
  sourceX: number;           // X-coordinate of source connection
  sourceY: number;           // Y-coordinate of source connection
  targetX: number;           // X-coordinate of target connection
  targetY: number;           // Y-coordinate of target connection
  sourcePosition: Position;  // Position of source handle
  targetPosition: Position;  // Position of target handle
  data: {                    // Custom data object
    type: string;            // 'sequence', 'choice', or 'branch'
    // Other data
  };
  selected: boolean;         // Whether the edge is selected
  style: object | string;    // Additional styling
}
```

### Path Calculation

The ChunkEdge calculates a bezier path for the connection:

```typescript
let [edgePath, labelX, labelY] = $derived(getBezierPath({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}));
```

### Styling and Appearance

The ChunkEdge styling is dynamically determined based on the connection type:

```typescript
function getEdgeStyle(type) {
  switch(type) {
    case 'sequence':
      return {
        stroke: '#22c55e',  /* Zinc green */
        strokeWidth: 2,
        strokeDasharray: 'none'
      };
    case 'choice':
      return {
        stroke: '#f59e0b',   /* Zinc amber */
        strokeWidth: 2,
        strokeDasharray: '8,4'
      };
    case 'branch':
      return {
        stroke: '#06b6d4',  /* Zinc cyan */
        strokeWidth: 2,
        strokeDasharray: '4,4'
      };
    default:
      return {
        stroke: '#3f3f46',
        strokeWidth: 2,
        strokeDasharray: 'none'
      };
  }
}
```

Each connection type also has a specific icon:

```typescript
function getConnectionIcon(type) {
  const icons = {
    sequence: '→',
    choice: '⚡',
    branch: '🌿'
  };
  return icons[type] || icons.sequence;
}
```

### Animations

The ChunkEdge includes animated elements for certain connection types:

```svelte
<!-- Animated Dots for Choice and Branch connections -->
{#if connectionType === 'choice'}
  <circle
    r="3"
    fill="#f59e0b"
    class="connection-dot choice-dot"
  >
    <animateMotion dur="2s" repeatCount="indefinite">
      <mpath href="#{id}" />
    </animateMotion>
  </circle>
{/if}

{#if connectionType === 'branch'}
  <circle
    r="2"
    fill="#10b981"
    class="connection-dot branch-dot"
  >
    <animateMotion dur="3s" repeatCount="indefinite">
      <mpath href="#{id}" />
    </animateMotion>
  </circle>
{/if}
```

### Custom Markers

The ChunkEdge defines custom arrow markers for different connection types:

```svelte
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <!-- Sequence arrowhead -->
    <marker
      id="arrowhead-sequence"
      markerWidth="10"
      markerHeight="10"
      refX="8"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path
        d="M0,0 L0,6 L9,3 z"
        fill="#3b82f6"
        stroke="#3b82f6"
      />
    </marker>
    
    <!-- Choice arrowhead -->
    <marker
      id="arrowhead-choice"
      markerWidth="12"
      markerHeight="12"
      refX="10"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path
        d="M0,0 L0,6 L9,3 z"
        fill="#f59e0b"
        stroke="#f59e0b"
      />
      <circle
        cx="3"
        cy="3"
        r="1"
        fill="#ffffff"
      />
    </marker>
    
    <!-- Branch arrowhead -->
    <marker
      id="arrowhead-branch"
      markerWidth="12"
      markerHeight="12"
      refX="10"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path
        d="M0,0 L0,6 L9,3 z"
        fill="#10b981"
        stroke="#10b981"
      />
      <path
        d="M2,1 L7,3 L2,5"
        fill="none"
        stroke="#ffffff"
        stroke-width="0.5"
      />
    </marker>
  </defs>
</svg>
```

### Event Handling

The ChunkEdge handles several events:

```typescript
function handleSelect() {
  uiStore.selectItems(id);
}

function handleDelete(event) {
  event.stopPropagation();
  storyChunksStore.removeConnection(id);
}

function handleContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();
  uiStore.showContextMenu({ x: event.clientX, y: event.clientY });
  uiStore.selectItems(id);
}
```

### Implementation Details

The ChunkEdge consists of several elements:

1. **Path**: The main SVG path for the connection
2. **Animated Elements**: Dots that move along the path for certain connection types
3. **Label**: A floating label that shows the connection type and can include a delete button
4. **Markers**: Custom arrowheads for different connection types

```svelte
<!-- Edge Path -->
<path
  {id}
  class="chunk-edge"
  class:selected={isSelected}
  class:animated={hasAnimation}
  d={edgePath}
  stroke={edgeStyle.stroke}
  stroke-width={edgeStyle.strokeWidth}
  stroke-dasharray={edgeStyle.strokeDasharray}
  fill="none"
  marker-end="url(#arrowhead-{connectionType})"
  style={typeof style === 'string' ? style : ''}
  onclick={handleSelect}
  oncontextmenu={handleContextMenu}
/>

<!-- Edge Label -->
{#if connectionLabel || isSelected}
  <div
    class="edge-label"
    class:selected={isSelected}
    class:choice-label={connectionType === 'choice'}
    class:branch-label={connectionType === 'branch'}
    style="transform: translate(-50%, -50%) translate({labelX}px, {labelY}px); position: absolute; pointer-events: all; z-index: 1000;"
  >
    <div class="label-content">
      <span class="connection-icon">{getConnectionIcon(connectionType)}</span>
      {#if connectionLabel}
        <span class="label-text">{connectionLabel}</span>
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
```

---

## Integration and Usage

### Registering Components with SvelteFlow

Register the custom components with SvelteFlow:

```typescript
// Node types for SvelteFlow
const nodeTypes = {
  chunk: ChunkNode
};

// Edge types for SvelteFlow
const edgeTypes = {
  chunk: ChunkEdge
};

// Pass them to the SvelteFlow component
<SvelteFlow
  {nodes}
  {edges}
  {nodeTypes}
  {edgeTypes}
  // Other props
>
  // Content
</SvelteFlow>
```

### Creating Nodes and Edges

Create nodes and edges with the correct structure:

```typescript
// Create a node
const newNode = {
  id: generateId(),
  type: 'chunk',
  position: { x: 100, y: 100 },
  data: {
    type: 'sequence',
    title: 'Opening Scene',
    description: 'Description here',
    hasImage: false
  },
  selected: false
};

// Create an edge
const newEdge = {
  id: `e${sourceId}-${targetId}`,
  source: sourceId,
  target: targetId,
  type: 'chunk',
  data: { type: 'sequence' },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
  selected: false
};
```

### Working with Connection Events

Handle connection events from SvelteFlow:

```typescript
function onConnect(connection) {
  console.log('Connection made:', connection);
  // Create new connection
  const newEdge = {
    id: `e${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    type: 'chunk',
    data: { type: 'sequence' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
    selected: false
  };
  edges = [...edges, newEdge];
}
```

### Selection and Interaction

Handle selection and interaction with nodes and edges:

```typescript
// Select a node or edge
function selectItem(id, isNode = true) {
  if (isNode) {
    nodes = nodes.map(n => ({
      ...n,
      selected: n.id === id
    }));
  } else {
    edges = edges.map(e => ({
      ...e,
      selected: e.id === id
    }));
  }
}

// Delete selected items
function deleteSelected() {
  const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
  nodes = nodes.filter(n => !n.selected);
  edges = edges.filter(e => 
    !e.selected && 
    !selectedNodeIds.includes(e.source) && 
    !selectedNodeIds.includes(e.target)
  );
}
```

These custom components provide a rich, interactive experience for users working with the Boardt canvas, enabling them to create and visualize complex story structures with different types of nodes and connections.