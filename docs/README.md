# Boardt Canvas Documentation

Welcome to the documentation for the Boardt canvas implementation using SvelteFlow. This documentation provides comprehensive guidance on how to use and extend the canvas functionality.

## Overview

The Boardt canvas is built using [SvelteFlow](https://svelteflow.dev/), a powerful library for building node-based editors and diagrams in Svelte applications. Our implementation includes custom nodes, edges, and interactive features for creating and managing story chunks in a visual canvas.

## Documentation Sections

### [Canvas Implementation](canvas-implementation.md)

This document provides a comprehensive guide to our canvas implementation using SvelteFlow, covering:

- SvelteFlow setup and initialization
- Node structure and customization
- Edge structure and customization
- Node creation and management
- Connection handling and events
- Canvas interactions and events
- Examples

### [ChunkCreator Component](chunk-creator-documentation.md)

This document details the ChunkCreator component, a modal interface for creating new chunk nodes:

- Component overview and structure
- Props and events
- State management
- Validation
- Event handling
- Integration with SvelteFlow
- Styling
- Usage examples

### [Node and Edge Components](node-edge-components.md)

This document provides detailed information about the ChunkNode and ChunkEdge components:

- Component overview
- Props and data structures
- Styling and appearance
- Handles and connections
- Path calculation
- Animations and custom markers
- Event handling
- Implementation details
- Integration and usage

## Quick Start

To add the canvas to a new page:

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
  import ChunkCreator from '$lib/components/Canvas/ChunkCreator.svelte';
  import { uiStore } from '$lib/stores/ui.svelte.js';
  import { storyChunksStore } from '$lib/stores/storyChunks.svelte.js';
  
  // Initialize nodes and edges
  let nodes = [];
  let edges = [];
  
  // Register custom components
  const nodeTypes = { chunk: ChunkNode };
  const edgeTypes = { chunk: ChunkEdge };
  
  // Handle connections
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
  
  // Handle chunk creation
  function handleCreateChunk(chunkData) {
    // Create new node
    const newNode = {
      id: crypto.randomUUID(),
      type: 'chunk',
      position: { 
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 150
      },
      data: {
        ...chunkData,
      },
      selected: false
    };
    nodes = [...nodes, newNode];
  }
</script>

<svelte:head>
  <style>
    @import '@xyflow/svelte/dist/style.css';
  </style>
</svelte:head>

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
    
    <!-- Add button to open chunk creator -->
    <div class="controls">
      <button on:click={() => uiStore.openChunkCreator()}>
        Create Chunk
      </button>
    </div>
  </SvelteFlow>
</SvelteFlowProvider>

<!-- Chunk Creator Modal -->
{#if uiStore.showChunkCreator}
  <ChunkCreator
    onClose={() => uiStore.closeChunkCreator()}
    onCreate={handleCreateChunk}
  />
{/if}
```

## Reference

For more detailed information, please refer to:

1. [SvelteFlow Official Documentation](https://svelteflow.dev/docs/introduction)
2. [SvelteFlow Examples](https://svelteflow.dev/examples)
3. [SvelteFlow API Reference](https://svelteflow.dev/api-reference)

## Key Features

- **Custom Nodes**: Visually distinct node types (sequence, choice, keyframe)
- **Custom Edges**: Different connection styles based on relationship type
- **Interactive Creation**: Modal interface for creating new nodes
- **Visual Styling**: Consistent dark theme with appropriate colors for node types
- **Animations**: Animated connections and interactions

## Troubleshooting

If you encounter any issues with the canvas implementation:

1. Check the browser console for errors
2. Ensure all required packages are installed
3. Verify that the nodes and edges have the correct structure
4. Confirm that custom components are properly registered

For persistent issues, consult the [SvelteFlow documentation](https://svelteflow.dev/docs/introduction) or file an issue in the project repository.