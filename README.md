# Storyboard Generator

AI-powered storyboard generator for video content creators built with SvelteKit 5 and Runes.

## Features

- AI-powered image generation using fal.ai
- Flexible canvas workspace with drag-and-drop functionality
- Formal set view for professional storyboard presentation
- Seamless switching between canvas and set views
- Local storage persistence for projects

## Tech Stack

- **Frontend**: SvelteKit 5 with Runes
- **Canvas**: SvelteFlow for drag-and-drop interactions
- **AI**: fal.ai API for image generation
- **State Management**: SvelteKit 5 Runes ($state, $derived, $effect)
- **Build Tool**: Vite

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
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