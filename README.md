# Storyboard Generator 🎬

AI-powered storyboard generator for video content creators built with SvelteKit 5 and Runes. Create interactive story chunks with branching narratives for complex storytelling workflows.

## 🎯 Current Status

**Version**: 0.1.0 (In Active Development)  
**Last Updated**: January 2025

### ✅ Completed Features (Task 7 - Canvas Flow Architect)

- **✅ Modern SvelteKit 5 + Runes Architecture**: Full migration to latest Svelte patterns
- **✅ Chunk-Based Canvas System**: Interactive story chunks instead of individual images
- **✅ Custom ChunkNode Components**: Visual story sequence containers with type-based styling
- **✅ ConnectionEdge System**: Visual story flow connections (sequence, choice, branch)
- **✅ Professional Dark Theme UI**: Responsive design with proper SvelteFlow integration
- **✅ Interactive Canvas Controls**: Drag & drop, zoom, pan, selection, keyboard shortcuts
- **✅ Sample Data Generation**: Test the system with pre-built story scenarios
- **✅ Error Handling & Safety**: Robust event handling and state management

### 🚧 In Development

- **🔄 Task 8**: ChunkCreator and KeyframeInserter components
- **🔄 Task 9**: Professional presentation view for client decks
- **🔄 Task 10**: Advanced story flow and branching logic
- **🔄 AI Integration**: fal.ai image generation (service layer complete)

### 📋 Planned Features

- AI-powered image generation using fal.ai
- Multi-prompt story sequence creation
- Keyframe insertion between story chunks
- Choose-your-own-adventure branching
- Professional client presentation views
- PDF export for storyboard presentations
- Local storage persistence for projects

## Tech Stack

- **Frontend**: SvelteKit 5 with Runes
- **Canvas**: SvelteFlow for drag-and-drop interactions
- **AI**: fal.ai API for image generation
- **State Management**: SvelteKit 5 Runes ($state, $derived, $effect)
- **Build Tool**: Vite

## 🚀 Quick Start

1. **Clone and Install**
```bash
git clone <repository-url>
cd boardt
pnpm install
```

2. **Start Development Server**
```bash
pnpm run dev
```

3. **Open Application**
   - Navigate to `http://localhost:5173/`
   - You should see the Storyboard Generator interface

## 🧪 Testing Current Features

### Canvas Functionality (Task 7 - COMPLETED)

1. **Launch the App**
   - Run `pnpm run dev` and open `http://localhost:5173/`
   - You'll see a dark-themed canvas interface

2. **Create Sample Data**
   - Click "Create Sample Data" button (top-left debug panel)
   - This creates 4 connected story chunks:
     - Opening Scene → The Choice → Investigation Path / Escape Path
   - You should see chunk nodes with colored borders and connections

3. **Test Canvas Interactions**
   - **Drag Chunks**: Click and drag any chunk to move it around
   - **Zoom**: Use mouse wheel or zoom controls (bottom-right)
   - **Pan**: Click and drag empty canvas areas
   - **Select**: Click chunks to select them
   - **Create New**: Click "Create First Chunk" when canvas is empty

4. **Test Keyboard Shortcuts**
   - `Delete/Backspace`: Delete selected chunks/connections
   - `Ctrl/Cmd + 0`: Reset zoom to 100%
   - `Ctrl/Cmd + +/-`: Zoom in/out
   - `Ctrl/Cmd + A`: Select all elements

5. **Explore Chunk Types**
   - **Sequence** (Blue): Linear story progression
   - **Choice** (Orange): Decision points with multiple paths
   - **Keyframe** (Green): Key moments in the story

6. **Connection Types**
   - **Sequence** connections: Solid blue lines
   - **Choice** connections: Dashed orange lines (animated)
   - **Branch** connections: Dashed green lines (flowing animation)

### Expected Behavior

✅ **Working Features:**
- Canvas renders with dark theme
- Chunk nodes display with proper styling
- Drag & drop functionality
- Zoom and pan controls
- Sample data generation
- Keyboard shortcuts
- Context menus (right-click)
- MiniMap and controls

⚠️  **Known Limitations:**
- ChunkCreator modal not yet implemented
- No AI image generation yet (service exists, UI pending)
- Presentation view is basic placeholder
- Connection creation by dragging handles may need refinement

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run tests
pnpm run test

# Type checking
pnpm run check
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Canvas/          # Canvas workspace components
│   │   ├── SetView/         # Formal set view components
│   │   ├── ImageGeneration/ # AI image generation components
│   │   └── UI/              # Shared UI components
│   ├── stores/              # Runes-based state management
│   ├── services/            # API and storage services
│   └── types/               # TypeScript type definitions
├── routes/
│   └── +page.svelte         # Main application page
└── app.html                 # HTML template
```

## Dependencies

### Core Dependencies
- `@xyflow/svelte`: Canvas drag-and-drop functionality
- `@fal-ai/client`: AI image generation API client

### Development Dependencies
- `@sveltejs/kit`: SvelteKit framework
- `svelte`: Svelte 5 with Runes support
- `typescript`: TypeScript support
- `vite`: Build tool and development server

### Testing Deplyment on Vercel
