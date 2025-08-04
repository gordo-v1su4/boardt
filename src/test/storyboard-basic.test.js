import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoryboardImage, CanvasLayout, StoryboardProject } from '../lib/types/storyboard.js';

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

describe('StoryboardImage Basic Tests', () => {
  let image;

  beforeEach(() => {
    vi.clearAllMocks();
    image = new StoryboardImage({
      url: 'https://example.com/image.jpg',
      prompt: 'A beautiful landscape'
    });
  });

  it('should create an image with provided values', () => {
    expect(image.url).toBe('https://example.com/image.jpg');
    expect(image.prompt).toBe('A beautiful landscape');
    expect(image.id).toBe('test-uuid-123');
  });

  it('should update canvas position', () => {
    image.updateCanvasPosition({ x: 150, y: 250 });
    expect(image.canvasPosition).toEqual({ x: 150, y: 250 });
  });

  it('should validate correctly', () => {
    const result = image.validate();
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should serialize to JSON', () => {
    const json = image.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('url', 'https://example.com/image.jpg');
    expect(json).toHaveProperty('prompt', 'A beautiful landscape');
  });
});

describe('CanvasLayout Basic Tests', () => {
  let layout;

  beforeEach(() => {
    layout = new CanvasLayout();
  });

  it('should create layout with default values', () => {
    expect(layout.nodes).toEqual([]);
    expect(layout.edges).toEqual([]);
    expect(layout.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('should add a node', () => {
    const node = { id: 'node1', position: { x: 100, y: 200 } };
    layout.addNode(node);
    
    expect(layout.nodes).toHaveLength(1);
    expect(layout.nodes[0]).toEqual(node);
  });

  it('should validate correctly', () => {
    const result = layout.validate();
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('StoryboardProject Basic Tests', () => {
  let project;

  beforeEach(() => {
    project = new StoryboardProject();
  });

  it('should create project with default values', () => {
    expect(project.id).toBe('test-uuid-123');
    expect(project.name).toBe('Untitled Storyboard');
    expect(project.images).toEqual([]);
    expect(project.setOrder).toEqual([]);
  });

  it('should add an image', () => {
    const image = new StoryboardImage({ url: 'test.jpg', prompt: 'test' });
    project.addImage(image);
    
    expect(project.images).toHaveLength(1);
    expect(project.images[0]).toBe(image);
    expect(project.setOrder).toContain(image.id);
  });

  it('should validate correctly', () => {
    const result = project.validate();
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});