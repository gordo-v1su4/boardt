import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoryboardImage, CanvasLayout, StoryboardProject } from '../lib/types/storyboard.js';

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  }
});

// Mock Date.now for consistent timestamps in tests
const mockDateNow = vi.fn(() => 1234567890000);
vi.stubGlobal('Date', {
  ...Date,
  now: mockDateNow
});

describe('StoryboardImage Comprehensive Tests', () => {
  let image;

  beforeEach(() => {
    vi.clearAllMocks();
    image = new StoryboardImage({
      url: 'https://example.com/image.jpg',
      prompt: 'A beautiful landscape'
    });
  });

  describe('constructor and properties', () => {
    it('should create an image with default values', () => {
      const defaultImage = new StoryboardImage();
      
      expect(defaultImage.id).toBeDefined();
      expect(defaultImage.url).toBe('');
      expect(defaultImage.prompt).toBe('');
      expect(defaultImage.timestamp).toBe(1234567890000);
      expect(defaultImage.metadata).toEqual({});
      expect(defaultImage.canvasPosition).toEqual({ x: 0, y: 0 });
      expect(defaultImage.canvasSize).toEqual({ width: 200, height: 200 });
      expect(defaultImage.rotation).toBe(0);
      expect(defaultImage.setIndex).toBe(0);
      expect(defaultImage.caption).toBe('');
    });

    it('should create an image with provided values', () => {
      const data = {
        id: 'custom-id',
        url: 'https://example.com/test.jpg',
        prompt: 'Test prompt',
        timestamp: 9876543210000,
        metadata: { test: true },
        canvasPosition: { x: 100, y: 200 },
        canvasSize: { width: 300, height: 400 },
        rotation: 45,
        setIndex: 5,
        caption: 'Test caption'
      };
      
      const customImage = new StoryboardImage(data);
      
      expect(customImage.id).toBe('custom-id');
      expect(customImage.url).toBe('https://example.com/test.jpg');
      expect(customImage.prompt).toBe('Test prompt');
      expect(customImage.timestamp).toBe(9876543210000);
      expect(customImage.metadata).toEqual({ test: true });
      expect(customImage.canvasPosition).toEqual({ x: 100, y: 200 });
      expect(customImage.canvasSize).toEqual({ width: 300, height: 400 });
      expect(customImage.rotation).toBe(45);
      expect(customImage.setIndex).toBe(5);
      expect(customImage.caption).toBe('Test caption');
    });
  });

  describe('update methods', () => {
    it('should update canvas position with valid coordinates', () => {
      image.updateCanvasPosition({ x: 150, y: 250 });
      expect(image.canvasPosition).toEqual({ x: 150, y: 250 });
    });

    it('should not update position with invalid coordinates', () => {
      const originalPosition = { ...image.canvasPosition };
      image.updateCanvasPosition({ x: 'invalid', y: 250 });
      expect(image.canvasPosition).toEqual(originalPosition);
    });

    it('should update canvas size with valid dimensions', () => {
      image.updateCanvasSize({ width: 300, height: 400 });
      expect(image.canvasSize).toEqual({ width: 300, height: 400 });
    });

    it('should not update size with invalid dimensions', () => {
      const originalSize = { ...image.canvasSize };
      image.updateCanvasSize({ width: -100, height: 400 });
      expect(image.canvasSize).toEqual(originalSize);
    });

    it('should update rotation with valid angle', () => {
      image.updateRotation(90);
      expect(image.rotation).toBe(90);
    });

    it('should normalize rotation angle', () => {
      image.updateRotation(450);
      expect(image.rotation).toBe(90);
    });

    it('should update set index with valid number', () => {
      image.updateSetIndex(5);
      expect(image.setIndex).toBe(5);
    });

    it('should update caption with valid string', () => {
      image.updateCaption('New caption');
      expect(image.caption).toBe('New caption');
    });
  });

  describe('validation', () => {
    it('should validate a correct image', () => {
      const result = image.validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing URL', () => {
      const invalidImage = new StoryboardImage({ url: '' });
      const result = invalidImage.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('URL is required and must be a string');
    });
  });

  describe('serialization', () => {
    it('should convert to JSON correctly', () => {
      const json = image.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('url', 'https://example.com/image.jpg');
      expect(json).toHaveProperty('prompt', 'A beautiful landscape');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('canvasPosition');
      expect(json).toHaveProperty('canvasSize');
    });

    it('should create instance from JSON correctly', () => {
      const json = image.toJSON();
      const recreated = StoryboardImage.fromJSON(json);
      
      expect(recreated.id).toBe(image.id);
      expect(recreated.url).toBe(image.url);
      expect(recreated.prompt).toBe(image.prompt);
      expect(recreated.canvasPosition).toEqual(image.canvasPosition);
    });
  });
});

describe('CanvasLayout Comprehensive Tests', () => {
  let layout;

  beforeEach(() => {
    layout = new CanvasLayout();
  });

  describe('node management', () => {
    it('should add a new node', () => {
      const node = { id: 'node1', position: { x: 100, y: 200 } };
      layout.addNode(node);
      
      expect(layout.nodes).toHaveLength(1);
      expect(layout.nodes[0]).toEqual(node);
    });

    it('should update existing node', () => {
      const node1 = { id: 'node1', position: { x: 100, y: 200 } };
      const node1Updated = { id: 'node1', position: { x: 150, y: 250 } };
      
      layout.addNode(node1);
      layout.addNode(node1Updated);
      
      expect(layout.nodes).toHaveLength(1);
      expect(layout.nodes[0]).toEqual(node1Updated);
    });

    it('should remove node and connected edges', () => {
      layout.addNode({ id: 'node1', position: { x: 100, y: 200 } });
      layout.addNode({ id: 'node2', position: { x: 300, y: 400 } });
      layout.edges = [{ id: 'edge1', source: 'node1', target: 'node2' }];
      
      layout.removeNode('node1');
      
      expect(layout.nodes).toHaveLength(1);
      expect(layout.nodes[0].id).toBe('node2');
      expect(layout.edges).toHaveLength(0);
    });

    it('should update node position', () => {
      layout.addNode({ id: 'node1', position: { x: 100, y: 200 } });
      layout.updateNodePosition('node1', { x: 150, y: 250 });
      
      const node = layout.getNode('node1');
      expect(node.position).toEqual({ x: 150, y: 250 });
    });
  });

  describe('validation', () => {
    it('should validate correct layout', () => {
      const result = layout.validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('StoryboardProject Comprehensive Tests', () => {
  let project;

  beforeEach(() => {
    project = new StoryboardProject();
  });

  describe('image management', () => {
    it('should add new image to project', () => {
      const image = new StoryboardImage({ url: 'test.jpg', prompt: 'test' });
      project.addImage(image);
      
      expect(project.images).toHaveLength(1);
      expect(project.images[0]).toBe(image);
      expect(project.setOrder).toContain(image.id);
    });

    it('should remove image from project', () => {
      const image = new StoryboardImage({ url: 'test.jpg', prompt: 'test' });
      project.addImage(image);
      project.removeImage(image.id);
      
      expect(project.images).toHaveLength(0);
      expect(project.setOrder).not.toContain(image.id);
    });

    it('should reorder images correctly', () => {
      const image1 = new StoryboardImage({ url: 'test1.jpg' });
      const image2 = new StoryboardImage({ url: 'test2.jpg' });
      const image3 = new StoryboardImage({ url: 'test3.jpg' });
      
      project.addImage(image1);
      project.addImage(image2);
      project.addImage(image3);
      
      const newOrder = [image3.id, image1.id, image2.id];
      project.reorderImages(newOrder);
      
      expect(project.setOrder).toEqual(newOrder);
      expect(project.getImage(image3.id).setIndex).toBe(0);
      expect(project.getImage(image1.id).setIndex).toBe(1);
      expect(project.getImage(image2.id).setIndex).toBe(2);
    });

    it('should return images in set order', () => {
      const image1 = new StoryboardImage({ url: 'test1.jpg' });
      const image2 = new StoryboardImage({ url: 'test2.jpg' });
      
      project.addImage(image1);
      project.addImage(image2);
      project.reorderImages([image2.id, image1.id]);
      
      const ordered = project.getOrderedImages();
      expect(ordered).toHaveLength(2);
      expect(ordered[0]).toBe(image2);
      expect(ordered[1]).toBe(image1);
    });
  });

  describe('validation', () => {
    it('should validate correct project', () => {
      const result = project.validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const image = new StoryboardImage({ url: 'test.jpg', prompt: 'test' });
      project.addImage(image);
      project.updateName('Test Project');
      
      const json = project.toJSON();
      const recreated = StoryboardProject.fromJSON(json);
      
      expect(recreated.id).toBe(project.id);
      expect(recreated.name).toBe('Test Project');
      expect(recreated.images).toHaveLength(1);
      expect(recreated.images[0]).toBeInstanceOf(StoryboardImage);
      expect(recreated.canvasLayout).toBeInstanceOf(CanvasLayout);
    });
  });
});