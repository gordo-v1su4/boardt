import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoryboardImage, CanvasLayout, StoryboardProject } from '../lib/types/storyboard.js';

// Mock crypto.randomUUID if not available
if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  };
}

describe('StoryboardImage', () => {
  let imageData;

  beforeEach(() => {
    imageData = {
      id: 'test-id',
      url: 'https://example.com/image.jpg',
      prompt: 'A beautiful landscape',
      timestamp: Date.now(),
      metadata: { width: 512, height: 512 },
      canvasPosition: { x: 100, y: 200 },
      canvasSize: { width: 300, height: 400 },
      rotation: 45,
      setIndex: 1,
      caption: 'Test caption'
    };
  });

  describe('constructor', () => {
    it('should create instance with provided data', () => {
      const image = new StoryboardImage(imageData);
      
      expect(image.id).toBe(imageData.id);
      expect(image.url).toBe(imageData.url);
      expect(image.prompt).toBe(imageData.prompt);
      expect(image.timestamp).toBe(imageData.timestamp);
      expect(image.metadata).toEqual(imageData.metadata);
      expect(image.canvasPosition).toEqual(imageData.canvasPosition);
      expect(image.canvasSize).toEqual(imageData.canvasSize);
      expect(image.rotation).toBe(imageData.rotation);
      expect(image.setIndex).toBe(imageData.setIndex);
      expect(image.caption).toBe(imageData.caption);
    });

    it('should create instance with default values when no data provided', () => {
      const image = new StoryboardImage();
      
      expect(image.id).toBeDefined();
      expect(image.url).toBe('');
      expect(image.prompt).toBe('');
      expect(image.timestamp).toBeGreaterThan(0);
      expect(image.metadata).toEqual({});
      expect(image.canvasPosition).toEqual({ x: 0, y: 0 });
      expect(image.canvasSize).toEqual({ width: 200, height: 200 });
      expect(image.rotation).toBe(0);
      expect(image.setIndex).toBe(0);
      expect(image.caption).toBe('');
    });

    it('should generate unique IDs when no ID provided', () => {
      const image1 = new StoryboardImage();
      const image2 = new StoryboardImage();
      
      expect(image1.id).not.toBe(image2.id);
    });
  });

  describe('updateCanvasPosition', () => {
    it('should update position with valid coordinates', () => {
      const image = new StoryboardImage(imageData);
      const newPosition = { x: 500, y: 600 };
      
      image.updateCanvasPosition(newPosition);
      
      expect(image.canvasPosition).toEqual(newPosition);
      expect(image.canvasPosition).not.toBe(newPosition); // Should be a copy
    });

    it('should not update position with invalid coordinates', () => {
      const image = new StoryboardImage(imageData);
      const originalPosition = { ...image.canvasPosition };
      
      image.updateCanvasPosition({ x: 'invalid', y: 100 });
      image.updateCanvasPosition({ x: 100 });
      image.updateCanvasPosition({});
      
      expect(image.canvasPosition).toEqual(originalPosition);
    });
  });

  describe('updateCanvasSize', () => {
    it('should update size with valid dimensions', () => {
      const image = new StoryboardImage(imageData);
      const newSize = { width: 500, height: 600 };
      
      image.updateCanvasSize(newSize);
      
      expect(image.canvasSize).toEqual(newSize);
    });

    it('should not update size with invalid dimensions', () => {
      const image = new StoryboardImage(imageData);
      const originalSize = { ...image.canvasSize };
      
      image.updateCanvasSize({ width: -100, height: 200 });
      image.updateCanvasSize({ width: 100, height: 0 });
      image.updateCanvasSize({ width: 'invalid', height: 200 });
      
      expect(image.canvasSize).toEqual(originalSize);
    });
  });

  describe('updateRotation', () => {
    it('should update rotation with valid angle', () => {
      const image = new StoryboardImage(imageData);
      
      image.updateRotation(90);
      expect(image.rotation).toBe(90);
      
      image.updateRotation(450); // Should normalize to 90
      expect(image.rotation).toBe(90);
      
      image.updateRotation(-45); // Should normalize to 315
      expect(image.rotation).toBe(315);
    });

    it('should not update rotation with invalid angle', () => {
      const image = new StoryboardImage(imageData);
      const originalRotation = image.rotation;
      
      image.updateRotation('invalid');
      image.updateRotation(null);
      
      expect(image.rotation).toBe(originalRotation);
    });
  });

  describe('updateSetIndex', () => {
    it('should update set index with valid number', () => {
      const image = new StoryboardImage(imageData);
      
      image.updateSetIndex(5);
      expect(image.setIndex).toBe(5);
    });

    it('should not update set index with invalid values', () => {
      const image = new StoryboardImage(imageData);
      const originalIndex = image.setIndex;
      
      image.updateSetIndex(-1);
      image.updateSetIndex('invalid');
      image.updateSetIndex(null);
      
      expect(image.setIndex).toBe(originalIndex);
    });
  });

  describe('updateCaption', () => {
    it('should update caption with valid string', () => {
      const image = new StoryboardImage(imageData);
      
      image.updateCaption('New caption');
      expect(image.caption).toBe('New caption');
    });

    it('should not update caption with invalid values', () => {
      const image = new StoryboardImage(imageData);
      const originalCaption = image.caption;
      
      image.updateCaption(123);
      image.updateCaption(null);
      
      expect(image.caption).toBe(originalCaption);
    });
  });

  describe('validate', () => {
    it('should return valid for correct data', () => {
      const image = new StoryboardImage(imageData);
      const result = image.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for missing required fields', () => {
      const image = new StoryboardImage({ url: '' });
      // Manually set empty ID to test validation
      image.id = '';
      const result = image.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ID is required and must be a string');
      expect(result.errors).toContain('URL is required and must be a string');
    });

    it('should validate canvas properties', () => {
      const image = new StoryboardImage({
        ...imageData,
        canvasPosition: { x: 'invalid', y: 100 },
        canvasSize: { width: -100, height: 200 }
      });
      const result = image.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Canvas position'))).toBe(true);
      expect(result.errors.some(e => e.includes('Canvas size'))).toBe(true);
    });
  });

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const image = new StoryboardImage(imageData);
      const json = image.toJSON();
      const restored = StoryboardImage.fromJSON(json);
      
      expect(restored.id).toBe(image.id);
      expect(restored.url).toBe(image.url);
      expect(restored.prompt).toBe(image.prompt);
      expect(restored.canvasPosition).toEqual(image.canvasPosition);
      expect(restored.canvasSize).toEqual(image.canvasSize);
      expect(restored.rotation).toBe(image.rotation);
    });
  });
});

describe('CanvasLayout', () => {
  let layoutData;

  beforeEach(() => {
    layoutData = {
      nodes: [
        { id: 'node1', position: { x: 100, y: 200 }, type: 'storyboard' },
        { id: 'node2', position: { x: 300, y: 400 }, type: 'storyboard' }
      ],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    };
  });

  describe('constructor', () => {
    it('should create instance with provided data', () => {
      const layout = new CanvasLayout(layoutData);
      
      expect(layout.nodes).toEqual(layoutData.nodes);
      expect(layout.edges).toEqual(layoutData.edges);
      expect(layout.viewport).toEqual(layoutData.viewport);
    });

    it('should create instance with default values', () => {
      const layout = new CanvasLayout();
      
      expect(layout.nodes).toEqual([]);
      expect(layout.edges).toEqual([]);
      expect(layout.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe('addNode', () => {
    it('should add new node', () => {
      const layout = new CanvasLayout();
      const node = { id: 'test-node', position: { x: 100, y: 200 } };
      
      layout.addNode(node);
      
      expect(layout.nodes).toHaveLength(1);
      expect(layout.nodes[0]).toEqual(node);
    });

    it('should update existing node', () => {
      const layout = new CanvasLayout(layoutData);
      const updatedNode = { id: 'node1', position: { x: 500, y: 600 } };
      
      layout.addNode(updatedNode);
      
      expect(layout.nodes).toHaveLength(2);
      expect(layout.nodes[0]).toEqual(updatedNode);
    });

    it('should not add node without ID', () => {
      const layout = new CanvasLayout();
      const originalLength = layout.nodes.length;
      
      layout.addNode({ position: { x: 100, y: 200 } });
      layout.addNode(null);
      
      expect(layout.nodes).toHaveLength(originalLength);
    });
  });

  describe('removeNode', () => {
    it('should remove node and connected edges', () => {
      const layout = new CanvasLayout({
        ...layoutData,
        edges: [{ id: 'edge1', source: 'node1', target: 'node2' }]
      });
      
      layout.removeNode('node1');
      
      expect(layout.nodes).toHaveLength(1);
      expect(layout.nodes[0].id).toBe('node2');
      expect(layout.edges).toHaveLength(0);
    });
  });

  describe('updateNodePosition', () => {
    it('should update node position', () => {
      const layout = new CanvasLayout(layoutData);
      const newPosition = { x: 500, y: 600 };
      
      layout.updateNodePosition('node1', newPosition);
      
      const node = layout.getNode('node1');
      expect(node.position).toEqual(newPosition);
    });

    it('should not update position for non-existent node', () => {
      const layout = new CanvasLayout(layoutData);
      
      layout.updateNodePosition('non-existent', { x: 500, y: 600 });
      
      // Should not throw error and layout should remain unchanged
      expect(layout.nodes).toHaveLength(2);
    });
  });

  describe('updateViewport', () => {
    it('should update viewport with valid values', () => {
      const layout = new CanvasLayout(layoutData);
      const newViewport = { x: 100, y: 200, zoom: 1.5 };
      
      layout.updateViewport(newViewport);
      
      expect(layout.viewport).toEqual(newViewport);
    });

    it('should not update viewport with invalid values', () => {
      const layout = new CanvasLayout(layoutData);
      const originalViewport = { ...layout.viewport };
      
      layout.updateViewport({ x: 'invalid', y: 200, zoom: 1 });
      layout.updateViewport(null);
      
      expect(layout.viewport).toEqual(originalViewport);
    });
  });

  describe('getNode', () => {
    it('should return node by ID', () => {
      const layout = new CanvasLayout(layoutData);
      
      const node = layout.getNode('node1');
      
      expect(node).toEqual(layoutData.nodes[0]);
    });

    it('should return null for non-existent node', () => {
      const layout = new CanvasLayout(layoutData);
      
      const node = layout.getNode('non-existent');
      
      expect(node).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all nodes and edges', () => {
      const layout = new CanvasLayout(layoutData);
      
      layout.clear();
      
      expect(layout.nodes).toHaveLength(0);
      expect(layout.edges).toHaveLength(0);
    });
  });

  describe('validate', () => {
    it('should return valid for correct data', () => {
      const layout = new CanvasLayout(layoutData);
      const result = layout.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate node structure', () => {
      const layout = new CanvasLayout({
        nodes: [{ position: { x: 100, y: 200 } }], // Missing ID
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      });
      const result = layout.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must have a string ID'))).toBe(true);
    });
  });

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const layout = new CanvasLayout(layoutData);
      const json = layout.toJSON();
      const restored = CanvasLayout.fromJSON(json);
      
      expect(restored.nodes).toEqual(layout.nodes);
      expect(restored.edges).toEqual(layout.edges);
      expect(restored.viewport).toEqual(layout.viewport);
    });
  });
});

describe('StoryboardProject', () => {
  let projectData;
  let testImages;

  beforeEach(() => {
    testImages = [
      new StoryboardImage({
        id: 'img1',
        url: 'https://example.com/img1.jpg',
        prompt: 'Image 1'
      }),
      new StoryboardImage({
        id: 'img2',
        url: 'https://example.com/img2.jpg',
        prompt: 'Image 2'
      })
    ];

    projectData = {
      id: 'project-1',
      name: 'Test Project',
      images: testImages,
      canvasLayout: new CanvasLayout(),
      setOrder: ['img1', 'img2'],
      createdAt: Date.now() - 1000,
      updatedAt: Date.now()
    };
  });

  describe('constructor', () => {
    it('should create instance with provided data', () => {
      const project = new StoryboardProject(projectData);
      
      expect(project.id).toBe(projectData.id);
      expect(project.name).toBe(projectData.name);
      expect(project.images).toHaveLength(2);
      expect(project.images[0]).toBeInstanceOf(StoryboardImage);
      expect(project.setOrder).toEqual(projectData.setOrder);
      expect(project.createdAt).toBe(projectData.createdAt);
      expect(project.updatedAt).toBe(projectData.updatedAt);
    });

    it('should create instance with default values', () => {
      const project = new StoryboardProject();
      
      expect(project.id).toBeDefined();
      expect(project.name).toBe('Untitled Storyboard');
      expect(project.images).toEqual([]);
      expect(project.canvasLayout).toBeInstanceOf(CanvasLayout);
      expect(project.setOrder).toEqual([]);
      expect(project.createdAt).toBeGreaterThan(0);
      expect(project.updatedAt).toBeGreaterThan(0);
    });

    it('should convert plain image objects to StoryboardImage instances', () => {
      const project = new StoryboardProject({
        images: [
          { id: 'img1', url: 'test.jpg', prompt: 'test' },
          new StoryboardImage({ id: 'img2', url: 'test2.jpg', prompt: 'test2' })
        ]
      });
      
      expect(project.images).toHaveLength(2);
      expect(project.images[0]).toBeInstanceOf(StoryboardImage);
      expect(project.images[1]).toBeInstanceOf(StoryboardImage);
    });
  });

  describe('addImage', () => {
    it('should add new image to project', () => {
      const project = new StoryboardProject();
      const image = new StoryboardImage({ id: 'new-img', url: 'test.jpg' });
      
      project.addImage(image);
      
      expect(project.images).toHaveLength(1);
      expect(project.images[0]).toBe(image);
      expect(project.setOrder).toContain('new-img');
    });

    it('should update existing image', () => {
      const project = new StoryboardProject(projectData);
      const updatedImage = new StoryboardImage({
        id: 'img1',
        url: 'updated.jpg',
        prompt: 'Updated prompt'
      });
      
      project.addImage(updatedImage);
      
      expect(project.images).toHaveLength(2);
      expect(project.images[0]).toBe(updatedImage);
      expect(project.images[0].prompt).toBe('Updated prompt');
    });

    it('should not add non-StoryboardImage objects', () => {
      const project = new StoryboardProject();
      const originalLength = project.images.length;
      
      project.addImage({ id: 'test', url: 'test.jpg' });
      project.addImage(null);
      
      expect(project.images).toHaveLength(originalLength);
    });
  });

  describe('removeImage', () => {
    it('should remove image and update related data', () => {
      const project = new StoryboardProject(projectData);
      project.canvasLayout.addNode({ id: 'img1', position: { x: 0, y: 0 } });
      
      project.removeImage('img1');
      
      expect(project.images).toHaveLength(1);
      expect(project.images[0].id).toBe('img2');
      expect(project.setOrder).not.toContain('img1');
      expect(project.canvasLayout.getNode('img1')).toBeNull();
    });
  });

  describe('getImage', () => {
    it('should return image by ID', () => {
      const project = new StoryboardProject(projectData);
      
      const image = project.getImage('img1');
      
      expect(image).toBe(testImages[0]);
    });

    it('should return null for non-existent image', () => {
      const project = new StoryboardProject(projectData);
      
      const image = project.getImage('non-existent');
      
      expect(image).toBeNull();
    });
  });

  describe('updateName', () => {
    it('should update project name', () => {
      const project = new StoryboardProject(projectData);
      
      project.updateName('New Project Name');
      
      expect(project.name).toBe('New Project Name');
    });

    it('should trim whitespace from name', () => {
      const project = new StoryboardProject(projectData);
      
      project.updateName('  Trimmed Name  ');
      
      expect(project.name).toBe('Trimmed Name');
    });

    it('should not update with invalid names', () => {
      const project = new StoryboardProject(projectData);
      const originalName = project.name;
      
      project.updateName('');
      project.updateName('   ');
      project.updateName(123);
      
      expect(project.name).toBe(originalName);
    });
  });

  describe('reorderImages', () => {
    it('should reorder images and update indices', () => {
      const project = new StoryboardProject(projectData);
      
      project.reorderImages(['img2', 'img1']);
      
      expect(project.setOrder).toEqual(['img2', 'img1']);
      expect(project.getImage('img2').setIndex).toBe(0);
      expect(project.getImage('img1').setIndex).toBe(1);
    });

    it('should filter out non-existent image IDs', () => {
      const project = new StoryboardProject(projectData);
      
      project.reorderImages(['img2', 'non-existent', 'img1']);
      
      expect(project.setOrder).toEqual(['img2', 'img1']);
    });

    it('should not update with invalid input', () => {
      const project = new StoryboardProject(projectData);
      const originalOrder = [...project.setOrder];
      
      project.reorderImages('invalid');
      project.reorderImages(null);
      
      expect(project.setOrder).toEqual(originalOrder);
    });
  });

  describe('getOrderedImages', () => {
    it('should return images in set order', () => {
      const project = new StoryboardProject(projectData);
      
      const orderedImages = project.getOrderedImages();
      
      expect(orderedImages).toHaveLength(2);
      expect(orderedImages[0].id).toBe('img1');
      expect(orderedImages[1].id).toBe('img2');
    });

    it('should filter out non-existent images', () => {
      const project = new StoryboardProject({
        ...projectData,
        setOrder: ['img1', 'non-existent', 'img2']
      });
      
      const orderedImages = project.getOrderedImages();
      
      expect(orderedImages).toHaveLength(2);
      expect(orderedImages.every(img => img !== null)).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all project data', () => {
      const project = new StoryboardProject(projectData);
      
      project.clear();
      
      expect(project.images).toHaveLength(0);
      expect(project.setOrder).toHaveLength(0);
      expect(project.canvasLayout.nodes).toHaveLength(0);
    });
  });

  describe('validate', () => {
    it('should return valid for correct data', () => {
      const project = new StoryboardProject(projectData);
      const result = project.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate required fields', () => {
      const project = new StoryboardProject({
        name: '',
        createdAt: -1
      });
      // Manually set empty ID to test validation
      project.id = '';
      const result = project.validate();
      
      console.log('Validation errors:', result.errors);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Project ID'))).toBe(true);
      expect(result.errors.some(e => e.includes('Project name'))).toBe(true);
      expect(result.errors.some(e => e.includes('Created timestamp'))).toBe(true);
    });

    it('should validate image instances', () => {
      const project = new StoryboardProject();
      // Manually add a non-StoryboardImage object to test validation
      project.images = [{ id: 'invalid' }];
      const result = project.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be a StoryboardImage instance'))).toBe(true);
    });

    it('should validate set order references', () => {
      const project = new StoryboardProject({
        images: [new StoryboardImage({ id: 'img1' })],
        setOrder: ['img1', 'non-existent']
      });
      const result = project.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('references non-existent image ID'))).toBe(true);
    });
  });

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const project = new StoryboardProject(projectData);
      const json = project.toJSON();
      const restored = StoryboardProject.fromJSON(json);
      
      expect(restored.id).toBe(project.id);
      expect(restored.name).toBe(project.name);
      expect(restored.images).toHaveLength(project.images.length);
      expect(restored.images[0]).toBeInstanceOf(StoryboardImage);
      expect(restored.canvasLayout).toBeInstanceOf(CanvasLayout);
      expect(restored.setOrder).toEqual(project.setOrder);
      expect(restored.createdAt).toBe(project.createdAt);
      expect(restored.updatedAt).toBe(project.updatedAt);
    });
  });
});