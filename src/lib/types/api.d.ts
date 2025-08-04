/**
 * TypeScript interfaces for API responses and external integrations
 */

// fal.ai API interfaces
export interface FalAIImageGenerationRequest {
  prompt: string;
  image_size?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  seed?: number;
}

export interface FalAIImageGenerationResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

export interface FalAIErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Image generation service interfaces
export interface ImageGenerationOptions {
  prompt: string;
  size?: string;
  steps?: number;
  guidance?: number;
  seed?: number;
}

export interface GeneratedImageResult {
  id: string;
  url: string;
  prompt: string;
  metadata: {
    width: number;
    height: number;
    seed: number;
    steps: number;
    guidance: number;
    timestamp: number;
  };
}

export interface GenerationProgress {
  stage: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number;
}