# Boardt Canvas Implementation with SvelteFlow

This documentation provides a comprehensive guide to our canvas implementation using SvelteFlow, covering setup, components, events, and interactions.

## Table of Contents

1. [SvelteFlow Setup and Initialization](#svelteflow-setup-and-initialization)
2. [Node Structure and Customization](#node-structure-and-customization)
3. [Edge Structure and Customization](#edge-structure-and-customization)
4. [Node Creation and Management](#node-creation-and-management)
5. [Connection Handling and Events](#connection-handling-and-events)
6. [Canvas Interactions and Events](#canvas-interactions-and-events)
7. [Examples](#examples)

## SvelteFlow Setup and Initialization

### Installation

To use SvelteFlow in your project, install it via npm or pnpm:

```bash
pnpm add @xyflow/svelte
```

### Basic Setup

Import the necessary components from SvelteFlow:

```svelte
<script>
  import {
    SvelteFlow,
    SvelteFlowProvider,
    Controls,
    Background,
    MiniMap
  } from '@xyflow/svelte';
</script>
```

### Import CSS

Don't forget to import the SvelteFlow styles in your app:

```svelte
<svelte:head>
  <style>
    @import '@xyflow/svelte/dist/style.css';
  </style>
</svelte:head>
```

### Basic Canvas Implementation

Set up the SvelteFlow canvas with nodes and edges:

```svelte
<SvelteFlowProvider>
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    {edgeTypes}
    onconnect={onConnect}
    fitView={true}
    snapGrid={[20, 20]}
    minZoom={0.1}
    maxZoom={2}
    class="dark-flow"
    nodesConnectable={true}
    elementsSelectable={true}
  >
    <Background gap={20} />
    <Controls />
    <MiniMap nodeColor="#22c55e" maskColor="rgba(9, 9, 11, 0.8)" pannable zoomable />
  </SvelteFlow>
</SvelteFlowProvider>
```

### Essential Configuration

Key configuration options:

- `nodeTypes`: Register custom node components
- `edgeTypes`: Register custom edge components
- `onconnect`: Handle connection events
- `fitView`: Automatically fit all nodes in the viewport
- `snapGrid`: Enable grid snapping for node positioning
- `minZoom` and `maxZoom`: Set zoom limits
- `nodesConnectable`: Allow nodes to be connected
- `elementsSelectable`: Allow nodes and edges to be selected

### Customizing Appearance

Add UI elements to SvelteFlow:

- `Background`: Adds a grid background to the canvas
- `Controls`: Adds zoom and fit view controls
- `MiniMap`: Adds a minimap for navigating large canvases

You can customize these with props:

```svelte
<Background gap={20} color="#292524" />
<Controls showZoom={true} showFitView={true} />
<MiniMap nodeColor="#22c55e" maskColor="rgba(9, 9, 11, 0.8)" pannable zoomable />
```

### Styling the Canvas

Apply custom styles to the SvelteFlow canvas:

```css
:global(.svelte-flow) {
  background: #09090b !important;
}

:global(.dark-flow) {
  background: #09090b !important;
}

:global(.svelte-flow__controls) {
  background: #1c1917;
  border: 1px solid #292524;
  border-radius: 8px;
}
```

## Node Structure and Customization

### Node Data Structure

Nodes in our implementation have the following structure:

```typescript
{
  id: string;                // Unique identifier
  type: string;              // Node type (e.g., 'chunk')
  position: { x: number, y: number }; // Position on canvas
  data: {                    // Custom data
    type: string;            // Chunk type (sequence, choice, keyframe)
    title: string;           // Node title
    description: string;     // Node description
    hasImage: boolean;       // Whether the node has an image
    // Additional properties as needed
  };
  selected: boolean;         // Selection state
}
```

### Custom Node Component

Create a custom node component (e.g., `ChunkNode.svelte`):

```svelte
<script>
  import { Handle, Position } from '@xyflow/svelte';
  
  // Props from SvelteFlow
  let { data, id, selected = false, dragging = false } = $props();
  
  // Handle styling and interactions
  // ...
</script>

<div class="custom-node" class:selected>
  <!-- Input Handle -->
  <Handle
    type="target"
    position={Position.Left}
    class="handle handle-left"
  />
  
  <!-- Node Content -->
  <div class="node-content">
    <!-- Your node content here -->
  </div>
  
  <!-- Output Handle -->
  <Handle
    type="source"
    position={Position.Right}
    class="handle handle-right"
  />
</div>
```

### Registering Custom Node Types

Register your custom node components with SvelteFlow:

```typescript
const nodeTypes = {
  chunk: ChunkNode
};
```

Then pass this to the SvelteFlow component:

```svelte
<SvelteFlow {nodeTypes} ... />
```

### Node Styling

Apply custom styles to your nodes:

```css
.custom-node {
  background: #09090b;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0;
  min-width: 220px;
  max-width: 300px;
  color: #fafaf9;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  position: relative;
  overflow: hidden;
}

.custom-node.selected {
  border-width: 3px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 8px 20px var(--shadow-color);
}

/* Handle styling */
:global(.handle) {
  width: 18px !important;
  height: 18px !important;
  border: 3px solid #292524 !important;
  border-radius: 50% !important;
  transition: all 0.2s !important;
  cursor: crosshair !important;
  z-index: 100 !important;
}
```

### Dynamic Styling Based on Node Type

You can dynamically style nodes based on their type:

```typescript
function getChunkStyle(type) {
  switch(type) {
    case 'sequence':
      return {
        borderColor: '#22c55e',
        shadowColor: 'rgba(34, 197, 94, 0.3)'
      };
    case 'choice':
      return {
        borderColor: '#f59e0b',
        shadowColor: 'rgba(245, 158, 11, 0.3)'
      };
    case 'keyframe':
      return {
        borderColor: '#06b6d4',
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

## Edge Structure and Customization

### Edge Data Structure

Edges in our implementation have the following structure:

```typescript
{
  id: string;                // Unique identifier (e.g., 'e1-2')
  source: string;            // Source node ID
  target: string;            // Target node ID
  type: string;              // Edge type (e.g., 'chunk')
  data: {                    // Custom data
    type: string;            // Connection type (sequence, choice, branch)
    // Additional properties as needed
  };
  markerEnd: {               // Arrow marker for the edge
    type: MarkerType.ArrowClosed,
    color: string            // Arrow color
  };
  selected: boolean;         // Selection state
}
```

### Custom Edge Component

Create a custom edge component (e.g., `ChunkEdge.svelte`):

```svelte
<script>
  import { getBezierPath } from '@xyflow/svelte';
  
  // Props from SvelteFlow
  let {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data = {},
    selected = false,
    style = {}
  } = $props();
  
  // Calculate the bezier path
  let [edgePath, labelX, labelY] = $derived(getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }));
  
  // Edge styling and interactions
  // ...
</script>

<!-- Edge Path -->
<path
  {id}
  class="custom-edge"
  class:selected
  d={edgePath}
  stroke={edgeStyle.stroke}
  stroke-width={edgeStyle.strokeWidth}
  stroke-dasharray={edgeStyle.strokeDasharray}
  fill="none"
  marker-end="url(#arrowhead-{connectionType})"
/>

<!-- Edge Label -->
<div
  class="edge-label"
  class:selected
  style="transform: translate(-50%, -50%) translate({labelX}px, {labelY}px); position: absolute; pointer-events: all;"
>
  <!-- Label content -->
</div>
```

### Registering Custom Edge Types

Register your custom edge components with SvelteFlow:

```typescript
const edgeTypes = {
  chunk: ChunkEdge
};
```

Then pass this to the SvelteFlow component:

```svelte
<SvelteFlow {edgeTypes} ... />
```

### Custom Arrow Markers

Define custom arrow markers for your edges:

```svelte
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
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
        fill="#22c55e"
        stroke="#22c55e"
      />
    </marker>
    
    <!-- Additional markers for other edge types -->
  </defs>
</svg>
```

### Edge Styling

Apply custom styles to your edges:

```css
.custom-edge {
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-edge:hover {
  stroke-width: 4;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.custom-edge.selected {
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
  background: #1c1917;
  border: 1px solid #292524;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #e4e4e7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  white-space: nowrap;
}
```

### Dynamic Edge Styling

Style edges based on their connection type:

```typescript
function getEdgeStyle(type) {
  switch(type) {
    case 'sequence':
      return {
        stroke: '#22c55e',
        strokeWidth: 2,
        strokeDasharray: 'none'
      };
    case 'choice':
      return {
        stroke: '#f59e0b',
        strokeWidth: 2,
        strokeDasharray: '8,4'
      };
    case 'branch':
      return {
        stroke: '#06b6d4',
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

## Node Creation and Management

### Creating Nodes Programmatically

Create nodes in your script:

```typescript
function createNode(data) {
  const newNode = {
    id: generateId(),
    type: 'chunk',
    position: { x: 100, y: 100 },
    data: {
      ...data
    },
    selected: false
  };
  
  nodes = [...nodes, newNode];
}
```

### Creating Nodes from User Input

Use a modal or form to create nodes:

```typescript
function handleCreateChunk(chunkData) {
  // Create a new node using the storyChunksStore
  const chunk = storyChunksStore.addChunk({
    title: chunkData.title,
    description: chunkData.description,
    chunkType: chunkData.type,
    position: {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    },
    metadata: chunkData.metadata || {}
  });
  
  // Update the nodes array to reflect the change
  const newNode = {
    id: chunk.id,
    type: 'chunk',
    position: chunk.position,
    data: {
      ...chunkData,
      id: chunk.id
    },
    selected: false
  };
  nodes = [...nodes, newNode];
}
```

### Selecting Nodes

Handle node selection:

```typescript
function selectNode(id, multiSelect = false) {
  if (!multiSelect) {
    // Deselect all nodes first
    nodes = nodes.map(n => ({ ...n, selected: false }));
  }
  
  // Select the target node
  nodes = nodes.map(n => 
    n.id === id 
      ? { ...n, selected: true } 
      : n
  );
}
```

### Deleting Nodes

Remove nodes and their connected edges:

```typescript
function deleteSelected() {
  const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
  
  // Remove selected nodes
  nodes = nodes.filter(n => !n.selected);
  
  // Remove connected edges
  edges = edges.filter(e => 
    !e.selected && 
    !selectedNodeIds.includes(e.source) && 
    !selectedNodeIds.includes(e.target)
  );
}
```

## Connection Handling and Events

### Creating Connections

Handle connection events:

```typescript
function onConnect(connection) {
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

### Selecting Edges

Handle edge selection:

```typescript
function selectEdge(id, multiSelect = false) {
  if (!multiSelect) {
    // Deselect all edges first
    edges = edges.map(e => ({ ...e, selected: false }));
  }
  
  // Select the target edge
  edges = edges.map(e => 
    e.id === id 
      ? { ...e, selected: true } 
      : e
  );
}
```

### Deleting Edges

Remove edges:

```typescript
function deleteEdge(id) {
  edges = edges.filter(e => e.id !== id);
}
```

## Canvas Interactions and Events

### Keyboard Shortcuts

Handle keyboard events:

```typescript
function handleKeydown(event) {
  // Delete selected elements
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    deleteSelected();
  }
  
  // Keyboard shortcuts with Ctrl/Cmd
  if (event.ctrlKey || event.metaKey) {
    switch(event.key) {
      case '0':
        event.preventDefault();
        resetZoom();
        break;
      case 'a':
        event.preventDefault();
        selectAll();
        break;
      case '+':
      case '=':
        event.preventDefault();
        zoomIn();
        break;
      case '-':
        event.preventDefault();
        zoomOut();
        break;
    }
  }
}
```

### Canvas Operations

Common canvas operations:

```typescript
function resetZoom() {
  // Using SvelteFlow's API
  const { setCenter, fitView } = useSvelteFlow();
  fitView();
}

function selectAll() {
  nodes = nodes.map(n => ({ ...n, selected: true }));
  edges = edges.map(e => ({ ...e, selected: true }));
}

function clearCanvas() {
  nodes = [];
  edges = [];
}
```

## Examples

### Basic Canvas with Nodes and Edges

```svelte
<script>
  import {
    SvelteFlow,
    SvelteFlowProvider,
    Controls,
    Background,
    MiniMap,
    MarkerType
  } from '@xyflow/svelte';
  import ChunkNode from '$lib/components/Canvas/ChunkNode.svelte';
  import ChunkEdge from '$lib/components/Canvas/ChunkEdge.svelte';
  
  // Node and edge data
  let nodes = [
    {
      id: '1',
      type: 'chunk',
      position: { x: 100, y: 100 },
      data: {
        type: 'sequence',
        title: 'Opening Scene',
        description: 'Our hero enters the mysterious forest.',
        hasImage: true
      }
    },
    {
      id: '2',
      type: 'chunk',
      position: { x: 400, y: 100 },
      data: {
        type: 'choice',
        title: 'The Fork in the Road',
        description: 'Two paths diverge.',
        hasImage: true
      }
    }
  ];
  
  let edges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'chunk',
      data: { type: 'sequence' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' }
    }
  ];
  
  // Node and edge types
  const nodeTypes = { chunk: ChunkNode };
  const edgeTypes = { chunk: ChunkEdge };
  
  // Connection handler
  function onConnect(connection) {
    const newEdge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      type: 'chunk',
      data: { type: 'sequence' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' }
    };
    edges = [...edges, newEdge];
  }
</script>

<SvelteFlowProvider>
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    {edgeTypes}
    onconnect={onConnect}
    fitView={true}
  >
    <Background gap={20} />
    <Controls />
    <MiniMap />
  </SvelteFlow>
</SvelteFlowProvider>
```

### Adding and Removing Nodes

```svelte
<script>
  // Existing code...
  
  function addNode() {
    const newNode = {
      id: String(nodes.length + 1),
      type: 'chunk',
      position: { 
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      },
      data: {
        type: 'sequence',
        title: `Node ${nodes.length + 1}`,
        description: 'New node description'
      }
    };
    
    nodes = [...nodes, newNode];
  }
  
  function removeSelectedNodes() {
    const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
    nodes = nodes.filter(n => !n.selected);
    edges = edges.filter(e => 
      !selectedNodeIds.includes(e.source) && 
      !selectedNodeIds.includes(e.target)
    );
  }
</script>

<!-- In your component -->
<div class="controls">
  <button on:click={addNode}>Add Node</button>
  <button on:click={removeSelectedNodes}>Remove Selected</button>
</div>
```

### Custom Node Interaction

```svelte
<!-- In ChunkNode.svelte -->
<script>
  // Existing code...
  
  function handleNodeClick(event) {
    event.stopPropagation();
    // Custom click behavior
  }
  
  function handleNodeDoubleClick(event) {
    event.stopPropagation();
    // Could trigger edit mode here
    console.log('Edit chunk:', id);
  }
</script>

<div
  class="chunk-node"
  class:selected
  onclick={handleNodeClick}
  ondblclick={handleNodeDoubleClick}
>
  <!-- Node content -->
</div>
```

These examples should help you get started with SvelteFlow in your project. Refer to the [official SvelteFlow documentation](https://svelteflow.dev/) for more advanced features and API details.