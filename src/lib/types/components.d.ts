/**
 * TypeScript interfaces for component props and events
 */

import type { StoryboardImage, CanvasLayout, StoryboardProject } from './storyboard.js';
import type { GeneratedImageResult, GenerationProgress } from './api.js';

// Canvas component props
export interface CanvasViewProps {
  images: StoryboardImage[];
  layout: CanvasLayout;
  selectedImageId?: string;
  onImageSelect?: (imageId: string | null) => void;
  onImageMove?: (imageId: string, position: { x: number; y: number }) => void;
  onImageResize?: (imageId: string, size: { width: number; height: number }) => void;
  onImageRotate?: (imageId: string, rotation: number) => void;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

export interface StoryboardNodeProps {
  id: string;
  image: StoryboardImage;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, position: { x: number; y: number }) => void;
  onResize?: (id: string, size: { width: number; height: number }) => void;
  onRotate?: (id: string, rotation: number) => void;
  onDelete?: (id: string) => void;
}

export interface CanvasControlsProps {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit?: () => void;
  onReset?: () => void;
}

// Set view component props
export interface SetViewProps {
  images: StoryboardImage[];
  onReorder?: (newOrder: string[]) => void;
  onImageSelect?: (imageId: string) => void;
  onImageEdit?: (imageId: string) => void;
  onImageDelete?: (imageId: string) => void;
}

export interface FrameCardProps {
  image: StoryboardImage;
  index: number;
  selected?: boolean;
  dragging?: boolean;
  onSelect?: (imageId: string) => void;
  onEdit?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
  onCaptionChange?: (imageId: string, caption: string) => void;
}

export interface SetControlsProps {
  totalFrames: number;
  selectedCount: number;
  onExport?: (format: 'pdf' | 'png' | 'json') => void;
  onClearSelection?: () => void;
  onSelectAll?: () => void;
}

// Image generation component props
export interface PromptInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onInput?: (value: string) => void;
  onSubmit?: (prompt: string) => void;
  onClear?: () => void;
}

export interface GenerationProgressProps {
  isGenerating: boolean;
  progress: GenerationProgress | null;
  onCancel?: () => void;
}

export interface ImageGalleryProps {
  images: GeneratedImageResult[];
  selectedIds?: string[];
  onImageSelect?: (imageId: string, selected: boolean) => void;
  onImageAdd?: (imageId: string) => void;
  onImageDelete?: (imageId: string) => void;
  onClearAll?: () => void;
}

// UI component props
export interface TabNavigationProps {
  activeTab: 'canvas' | 'set';
  onTabChange?: (tab: 'canvas' | 'set') => void;
  disabled?: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  progress?: number;
}

export interface ErrorMessageProps {
  error: string | Error | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
}

// Event interfaces
export interface ImageMoveEvent {
  imageId: string;
  position: { x: number; y: number };
  previousPosition: { x: number; y: number };
}

export interface ImageResizeEvent {
  imageId: string;
  size: { width: number; height: number };
  previousSize: { width: number; height: number };
}

export interface ImageRotateEvent {
  imageId: string;
  rotation: number;
  previousRotation: number;
}

export interface ViewportChangeEvent {
  viewport: { x: number; y: number; zoom: number };
  previousViewport: { x: number; y: number; zoom: number };
}

export interface ReorderEvent {
  newOrder: string[];
  previousOrder: string[];
  movedImageId: string;
  fromIndex: number;
  toIndex: number;
}

// Store interfaces
export interface StoryboardStoreState {
  project: StoryboardProject;
  selectedImageId: string | null;
  currentView: 'canvas' | 'set';
  isDirty: boolean;
}

export interface ImageGenerationStoreState {
  isGenerating: boolean;
  currentPrompt: string;
  generationProgress: GenerationProgress | null;
  generatedImages: GeneratedImageResult[];
  error: string | null;
}

export interface UIStoreState {
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;
}