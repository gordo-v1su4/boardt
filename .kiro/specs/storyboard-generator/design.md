# Design Document

## Overview

The Storyboard Generator is a SvelteKit 5 single-page application that enables video content creators to generate AI-powered storyboards using fal.ai. The application features a dual-interface design: a flexible canvas workspace powered by SvelteFlow for creative arrangement, and a formal set view for professional presentation. The app leverages SvelteKit 5's Runes for reactive state management and provides seamless switching between the two viewing modes.

## Architecture

### Technology Stack
- **Frontend Framework**: SvelteKit 5 with Runes
- **Canvas Library**: SvelteFlow for drag-and-drop canvas functionality
- **AI Image Generation**: fal.ai API integration
- **State Management**: SvelteKit 5 Runes ($state, $derived, $effect)
- **Styling**: CSS with potential Tailwind CSS integration
- **Build Tool**: Vite (included with SvelteKit)

### Application Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── CanvasView.svelte
│   │   │   ├── StoryboardNode.svelte
│   │   │   └── CanvasControls.svelte
│   │   ├── SetView/
│   │   │   ├── SetView.svelte
│   │   │   ├── FrameCard.svelte
│   │   │   └── SetControls.svelte
│   │   ├── ImageGeneration/
│   │   │   ├── PromptInput.svelte
│   │   │   ├── GenerationProgress.svelte
│   │   │   └── ImageGallery.svelte
│   │   └── UI/
│   │       ├── TabNavigation.svelte
│   │       ├── LoadingSpinner.svelte
│   │       └── ErrorMessage.svelte
│   ├── stores/
│   │   ├── storyboard.svelte.js
│   │   ├── imageGeneration.svelte.js
│   │   └── ui.svelte.js
│   ├── services/
│   │   ├── falai.js
│   │   └── storage.js
│   └── types/
│       └── storyboard.js
├── routes/
│   └── +page.svelte
└── app.html
```

## Components and Interfaces

### Core State Management (Runes-based)

**StoryboardStore** (`lib/stores/storyboard.svelte.js`)
```javascript
class StoryboardStore {
  images = $state([]);
  canvasLayout = $state({ nodes: [], edges: [] });
  setOrder = $state([]);
  currentView = $state('canvas');
  
  // Derived states
  orderedFrames = $derived(() => 
    this.setOrder.map(id => this.images.find(img => img.id === id))
  );
}
```

**ImageGenerationStore** (`lib/stores/imageGeneration.svelte.js`)
```javascript
class ImageGenerationStore {
  isGenerating = $state(false);
  currentPrompt = $state('');
  generationProgress = $state(0);
  error = $state(null);
}
```

### Canvas Components (SvelteFlow Integration)

**CanvasView.svelte**
- Integrates SvelteFlow for node-based canvas
- Custom StoryboardNode components for each image
- Handles drag-and-drop positioning
- Provides zoom, pan, and selection controls

**StoryboardNode.svelte**
- Custom SvelteFlow node type
- Displays generated images
- Handles resize and rotation
- Provides context menu for actions

### Set View Components

**SetView.svelte**
- Grid-based layout for formal presentation
- Drag-and-drop reordering
- Frame numbering and captions
- Export functionality

**FrameCard.svelte**
- Individual frame representation
- Thumbnail display with metadata
- Edit and delete controls

### Image Generation Components

**PromptInput.svelte**
- Text input for AI prompts
- Generation trigger button
- Prompt history and suggestions

**GenerationProgress.svelte**
- Loading states and progress indicators
- Error handling display
- Retry functionality

## Data Models

### Image Model
```javascript
class StoryboardImage {
  constructor(data) {
    this.id = data.id || crypto.randomUUID();
    this.url = data.url;
    this.prompt = data.prompt;
    this.timestamp = data.timestamp || Date.now();
    this.metadata = data.metadata || {};
    
    // Canvas-specific properties
    this.canvasPosition = data.canvasPosition || { x: 0, y: 0 };
    this.canvasSize = data.canvasSize || { width: 200, height: 200 };
    this.rotation = data.rotation || 0;
    
    // Set view properties
    this.setIndex = data.setIndex || 0;
    this.caption = data.caption || '';
  }
}
```

### Canvas Layout Model
```javascript
class CanvasLayout {
  constructor() {
    this.nodes = []; // SvelteFlow nodes
    this.edges = []; // SvelteFlow edges (for future connections)
    this.viewport = { x: 0, y: 0, zoom: 1 };
  }
}
```

### Project Model
```javascript
class StoryboardProject {
  constructor() {
    this.id = crypto.randomUUID();
    this.name = 'Untitled Storyboard';
    this.images = [];
    this.canvasLayout = new CanvasLayout();
    this.setOrder = [];
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
}
```

## Error Handling

### API Error Handling
- Implement retry logic for fal.ai API calls
- Graceful degradation when API is unavailable
- User-friendly error messages for different failure types
- Offline state detection and handling

### Image Loading Errors
- Fallback images for failed loads
- Progressive loading with placeholders
- Error boundaries for component failures

### State Persistence Errors
- Local storage fallbacks
- Data validation and recovery
- Migration handling for schema changes

## Testing Strategy

### Unit Testing
- Component testing with Vitest and Testing Library
- Store logic testing with mock data
- Utility function testing
- API service mocking and testing

### Integration Testing
- Canvas interaction testing
- View switching functionality
- Image generation workflow testing
- Data persistence testing

### End-to-End Testing
- Complete user workflows with Playwright
- Cross-browser compatibility testing
- Performance testing under load
- Accessibility testing

### Performance Testing
- Image loading optimization testing
- Canvas rendering performance
- Memory usage monitoring
- Bundle size optimization

## Technical Implementation Details

### SvelteFlow Integration
- Custom node types for storyboard images
- Handle positioning and sizing through SvelteFlow's node system
- Implement custom controls for image manipulation
- Utilize SvelteFlow's built-in pan, zoom, and selection features

### fal.ai Integration
- RESTful API calls for image generation
- Streaming support for real-time progress updates
- Rate limiting and queue management
- Image optimization and caching

### State Synchronization
- Bidirectional sync between canvas and set views
- Real-time updates using Runes reactivity
- Persistent storage with automatic saving
- Conflict resolution for concurrent edits

### Responsive Design
- Mobile-first approach with progressive enhancement
- Touch gesture support for canvas interactions
- Adaptive layouts for different screen sizes
- Performance optimization for mobile devices