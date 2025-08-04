/**
 * fal.ai API integration service
 */
import * as fal from '@fal-ai/client';

// Configure fal.ai client
// In a real app, this would come from environment variables
const FAL_API_KEY = 'your-fal-api-key-here';

if (typeof window !== 'undefined' && FAL_API_KEY !== 'your-fal-api-key-here') {
  fal.config({
    credentials: FAL_API_KEY
  });
}

/**
 * Generate an image using fal.ai
 * @param {Object} options - Generation options
 * @param {string} options.prompt - Text prompt for image generation
 * @param {string} options.size - Image size preset
 * @param {number} options.steps - Number of inference steps
 * @param {number} options.guidance - Guidance scale
 * @param {number} options.seed - Random seed (optional)
 * @returns {Promise<Object>} Generation result
 */
export async function generateImage(options) {
  try {
    // Validate options
    if (!options.prompt || typeof options.prompt !== 'string') {
      throw new Error('Prompt is required and must be a string');
    }

    // Map our options to fal.ai format
    const falOptions = {
      prompt: options.prompt,
      image_size: options.size || 'square_hd',
      num_inference_steps: options.steps || 50,
      guidance_scale: options.guidance || 7.5,
      num_images: 1,
      enable_safety_checker: true
    };

    // Add seed if provided
    if (options.seed && typeof options.seed === 'number') {
      falOptions.seed = options.seed;
    }

    // For development/demo purposes, return mock data if no API key is configured
    if (FAL_API_KEY === 'your-fal-api-key-here') {
      return generateMockImage(options);
    }

    // Call fal.ai API
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: falOptions,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
      }
    });

    if (result && result.images && result.images.length > 0) {
      const image = result.images[0];
      
      return {
        success: true,
        data: {
          id: crypto.randomUUID(),
          url: image.url,
          prompt: options.prompt,
          metadata: {
            width: image.width,
            height: image.height,
            seed: result.seed,
            steps: falOptions.num_inference_steps,
            guidance: falOptions.guidance_scale,
            timestamp: Date.now()
          }
        }
      };
    } else {
      throw new Error('No images returned from fal.ai');
    }
  } catch (error) {
    console.error('fal.ai generation error:', error);
    
    return {
      success: false,
      error: {
        message: error.message || 'Image generation failed',
        code: error.code || 'GENERATION_ERROR',
        details: error
      }
    };
  }
}

/**
 * Generate multiple images in batch
 * @param {Array} prompts - Array of prompts
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Array of generation results
 */
export async function generateBatch(prompts, options = {}) {
  const results = [];
  
  for (const prompt of prompts) {
    try {
      const result = await generateImage({ ...options, prompt });
      results.push(result);
      
      // Add delay between requests to avoid rate limiting
      if (prompts.indexOf(prompt) < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      results.push({
        success: false,
        error: {
          message: error.message,
          prompt
        }
      });
    }
  }
  
  return results;
}

/**
 * Generate mock image data for development/demo
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Mock generation result
 */
async function generateMockImage(options) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Generate a placeholder image URL
  const width = 512;
  const height = 512;
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  
  // Use a placeholder service that generates images based on text
  const encodedPrompt = encodeURIComponent(options.prompt.slice(0, 50));
  const placeholderUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  
  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      url: placeholderUrl,
      prompt: options.prompt,
      metadata: {
        width,
        height,
        seed,
        steps: options.steps || 50,
        guidance: options.guidance || 7.5,
        timestamp: Date.now()
      }
    }
  };
}

/**
 * Validate fal.ai API configuration
 * @returns {Promise<Object>} Validation result
 */
export async function validateApiConfig() {
  try {
    if (FAL_API_KEY === 'your-fal-api-key-here') {
      return {
        valid: false,
        message: 'API key not configured - using mock data',
        usingMock: true
      };
    }

    // Try a simple API call to validate the key
    const testResult = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: 'test',
        image_size: 'square',
        num_inference_steps: 1,
        num_images: 1
      }
    });

    return {
      valid: true,
      message: 'API key is valid',
      usingMock: false
    };
  } catch (error) {
    return {
      valid: false,
      message: error.message || 'API validation failed',
      usingMock: true,
      error
    };
  }
}

/**
 * Get available image size presets
 * @returns {Array} Array of size options
 */
export function getImageSizeOptions() {
  return [
    { value: 'square_hd', label: 'Square HD (1024x1024)', width: 1024, height: 1024 },
    { value: 'square', label: 'Square (512x512)', width: 512, height: 512 },
    { value: 'portrait_4_3', label: 'Portrait 4:3 (768x1024)', width: 768, height: 1024 },
    { value: 'portrait_16_9', label: 'Portrait 16:9 (576x1024)', width: 576, height: 1024 },
    { value: 'landscape_4_3', label: 'Landscape 4:3 (1024x768)', width: 1024, height: 768 },
    { value: 'landscape_16_9', label: 'Landscape 16:9 (1024x576)', width: 1024, height: 576 }
  ];
}

/**
 * Get recommended settings for different use cases
 * @param {string} useCase - Use case ('storyboard', 'concept', 'detailed')
 * @returns {Object} Recommended settings
 */
export function getRecommendedSettings(useCase = 'storyboard') {
  const settings = {
    storyboard: {
      size: 'landscape_16_9',
      steps: 30,
      guidance: 7.5,
      description: 'Optimized for storyboard frames with cinematic aspect ratio'
    },
    concept: {
      size: 'square_hd',
      steps: 50,
      guidance: 8.0,
      description: 'High quality for concept art and detailed illustrations'
    },
    detailed: {
      size: 'portrait_4_3',
      steps: 75,
      guidance: 9.0,
      description: 'Maximum quality for detailed character and environment art'
    },
    quick: {
      size: 'square',
      steps: 20,
      guidance: 6.0,
      description: 'Fast generation for quick iterations and sketches'
    }
  };

  return settings[useCase] || settings.storyboard;
}

/**
 * Estimate generation time based on settings
 * @param {Object} options - Generation options
 * @returns {number} Estimated time in seconds
 */
export function estimateGenerationTime(options) {
  const baseTime = 10; // Base time in seconds
  const stepMultiplier = 0.2; // Additional time per inference step
  const sizeMultiplier = {
    'square': 1,
    'square_hd': 1.5,
    'portrait_4_3': 1.2,
    'portrait_16_9': 1.2,
    'landscape_4_3': 1.2,
    'landscape_16_9': 1.2
  };

  const steps = options.steps || 50;
  const size = options.size || 'square_hd';
  
  return Math.round(baseTime + (steps * stepMultiplier) * (sizeMultiplier[size] || 1));
}

/**
 * Format generation error for user display
 * @param {Object} error - Error object
 * @returns {string} User-friendly error message
 */
export function formatGenerationError(error) {
  if (!error) return 'Unknown error occurred';
  
  const errorMessages = {
    'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.',
    'INVALID_PROMPT': 'The prompt contains invalid content. Please modify and try again.',
    'QUOTA_EXCEEDED': 'API quota exceeded. Please check your fal.ai account.',
    'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
    'GENERATION_ERROR': 'Image generation failed. Please try again with a different prompt.'
  };

  return errorMessages[error.code] || error.message || 'Image generation failed';
}
