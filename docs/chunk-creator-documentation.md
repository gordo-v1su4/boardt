# ChunkCreator Component Documentation

This document provides detailed information about the ChunkCreator component, which is a modal interface for creating new chunk nodes in the Boardt canvas.

## Table of Contents

1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [Props and Events](#props-and-events)
4. [State Management](#state-management)
5. [Validation](#validation)
6. [Event Handling](#event-handling)
7. [Integration with SvelteFlow](#integration-with-svelteflow)
8. [Styling](#styling)
9. [Usage Example](#usage-example)

## Overview

The ChunkCreator component is a modal dialog that allows users to create new chunk nodes in the Boardt canvas. It provides a form interface for configuring various properties of a chunk, such as type, title, description, and metadata.

## Component Structure

The ChunkCreator component consists of the following main parts:

1. **Modal Container**: A backdrop and container that houses the form
2. **Chunk Type Selection**: A grid of options for selecting the chunk type
3. **Chunk Details Form**: Fields for entering title, description, and metadata
4. **AI Image Generation**: Option to generate an image for the chunk
5. **Footer Actions**: Buttons for canceling or creating the chunk

## Props and Events

### Props

The component accepts the following props:

```typescript
{
  onClose: () => void;         // Function to call when the modal is closed
  onCreate: (chunkData) => void; // Function to call when a chunk is created
}
```

### Events

The component dispatches the following events:

- `create`: When a new chunk is created
- `close`: When the modal is closed

## State Management

The component uses Svelte 5 Runes for state management:

```typescript
// Form state
let selectedType = $state('sequence');
let chunkTitle = $state('');
let chunkDescription = $state('');
let generateImage = $state(false);
let imagePrompt = $state('');
let tags = $state('');
let duration = $state('5');
let characters = $state('');

// Validation state
let errors = $state({
  title: '',
  description: '',
  imagePrompt: '',
  duration: ''
});
let isSubmitting = $state(false);

// Computed properties using $derived
let selectedTypeInfo = $derived(chunkTypes.find(type => type.id === selectedType));
let isValid = $derived(chunkTitle.trim().length > 0 && Object.values(errors).every(error => error === ''));
let tagList = $derived(tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0));
```

## Chunk Types

The component defines three types of chunks:

1. **Sequence**: A linear story progression that flows naturally to the next scene
   - Icon: 📺
   - Color: #3b82f6 (blue)

2. **Choice**: A decision point where the story can branch into multiple paths
   - Icon: 🔀
   - Color: #f59e0b (amber)

3. **Keyframe**: A critical moment or key visual that anchors the story
   - Icon: 🎯
   - Color: #10b981 (green)

## Validation

The component includes form validation:

```typescript
function validateForm() {
  const newErrors = {
    title: '',
    description: '',
    imagePrompt: '',
    duration: ''
  };

  if (!chunkTitle.trim()) {
    newErrors.title = 'Title is required';
  } else if (chunkTitle.trim().length < 3) {
    newErrors.title = 'Title must be at least 3 characters';
  } else if (chunkTitle.trim().length > 100) {
    newErrors.title = 'Title must be less than 100 characters';
  }

  if (chunkDescription.length > 500) {
    newErrors.description = 'Description must be less than 500 characters';
  }

  if (generateImage && imagePrompt.trim().length === 0) {
    newErrors.imagePrompt = 'Image prompt is required when generating images';
  }

  if (duration && (isNaN(Number(duration)) || Number(duration) < 1 || Number(duration) > 60)) {
    newErrors.duration = 'Duration must be between 1 and 60 seconds';
  }

  errors = newErrors;
  return Object.values(newErrors).every(error => error === '');
}
```

## Event Handling

The component handles various events:

### Type Selection

```typescript
function handleTypeSelect(type) {
  selectedType = type.id;
  
  // Auto-populate example content for better UX
  if (!chunkTitle.trim() && type.examples && type.examples.length > 0) {
    chunkTitle = type.examples[0];
  }
}
```

### Form Submission

```typescript
function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isSubmitting = true;

  const chunkData = {
    type: selectedType,
    title: chunkTitle.trim(),
    description: chunkDescription.trim(),
    hasImage: generateImage,
    imagePrompt: generateImage ? imagePrompt.trim() : '',
    tags: tagList,
    metadata: {
      duration: duration ? `${duration}s` : '5s',
      characters: characters.trim() || undefined,
      createdAt: new Date().toISOString()
    }
  };

  // Simulate async operation
  setTimeout(() => {
    onCreate(chunkData);
    dispatch('create', chunkData);
    isSubmitting = false;
    handleClose();
  }, 500);
}
```

### Keyboard Shortcuts

```typescript
function handleKeydown(event) {
  // Close modal on Escape
  if (event.key === 'Escape') {
    handleClose();
  }
  // Submit on Ctrl/Cmd + Enter
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    handleSubmit();
  }
}
```

## Integration with SvelteFlow

The ChunkCreator component integrates with SvelteFlow through the main canvas component:

```svelte
<!-- In your main canvas component -->
{#if uiStore.showChunkCreator}
  <ChunkCreator
    onClose={() => uiStore.closeChunkCreator()}
    onCreate={handleCreateChunk}
  />
{/if}

<!-- Handle chunk creation -->
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
  
  // Close the modal using the store
  uiStore.closeChunkCreator();
}
```

## Styling

The ChunkCreator component uses a dark theme with custom styling for each form element, consistent with the overall application design. Here are some key styling features:

- **Modal Backdrop**: A semi-transparent dark background with blur effect
- **Modal Container**: Dark background with rounded corners and border
- **Type Cards**: Interactive cards with different colors based on the chunk type
- **Form Inputs**: Custom styled inputs with focus states and error highlighting
- **Responsive Design**: Adapts to different screen sizes with media queries

## Usage Example

```svelte
<script>
  import ChunkCreator from '$lib/components/Canvas/ChunkCreator.svelte';
  import { uiStore } from '$lib/stores/ui.svelte.js';
  
  function handleCreateChunk(chunkData) {
    console.log('New chunk created:', chunkData);
    // Add the chunk to your data model
    // ...
  }
</script>

<!-- Toggle button to show the modal -->
<button on:click={() => uiStore.openChunkCreator()}>
  Create New Chunk
</button>

<!-- Render the modal when shown -->
{#if uiStore.showChunkCreator}
  <ChunkCreator
    onClose={() => uiStore.closeChunkCreator()}
    onCreate={handleCreateChunk}
  />
{/if}
```

## Advanced Features

### Auto-Population

The component intelligently auto-populates the title field with an example when a chunk type is selected, improving user experience:

```typescript
function handleTypeSelect(type) {
  selectedType = type.id;
  
  // Auto-populate example content for better UX
  if (!chunkTitle.trim() && type.examples && type.examples.length > 0) {
    chunkTitle = type.examples[0];
  }
}
```

### Reactive Validation

The component uses Svelte's reactivity to validate form fields as they change:

```typescript
$effect(() => {
  if (chunkTitle || chunkDescription || imagePrompt || duration) {
    validateForm();
  }
});
```

### Focus Management

The component manages focus for accessibility:

```typescript
onMount(() => {
  titleInput?.focus();
  document.addEventListener('keydown', handleKeydown);
  
  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
});
```

### Responsive UI

The component adapts to different screen sizes:

```css
@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .type-grid {
    grid-template-columns: 1fr;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
```

This comprehensive documentation should help developers understand and use the ChunkCreator component effectively within the Boardt application.