import { describe, it, expect, vi } from 'vitest';

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123')
  }
});

// Mock Date.now for consistent timestamps in tests
const mockDateNow = vi.fn(() => 1234567890000);
vi.stubGlobal('Date', {
  ...Date,
  now: mockDateNow
});

describe('Data Models Import', () => {
  it('should import StoryboardImage', async () => {
    const { StoryboardImage } = await import('../lib/types/storyboard.js');
    expect(StoryboardImage).toBeDefined();
    
    const image = new StoryboardImage();
    expect(image.id).toBe('test-uuid-123');
    expect(image.timestamp).toBe(1234567890000);
  });

  it('should import CanvasLayout', async () => {
    const { CanvasLayout } = await import('../lib/types/storyboard.js');
    expect(CanvasLayout).toBeDefined();
    
    const layout = new CanvasLayout();
    expect(layout.nodes).toEqual([]);
    expect(layout.edges).toEqual([]);
  });

  it('should import StoryboardProject', async () => {
    const { StoryboardProject } = await import('../lib/types/storyboard.js');
    expect(StoryboardProject).toBeDefined();
    
    const project = new StoryboardProject();
    expect(project.id).toBe('test-uuid-123');
    expect(project.name).toBe('Untitled Storyboard');
  });
});