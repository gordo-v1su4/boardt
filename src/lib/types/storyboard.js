/**
 * Core data model for storyboard images
 */
export class StoryboardImage {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.url = data.url || '';
    this.prompt = data.prompt || '';
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

  /**
   * Update canvas position
   * @param {Object} position - New position {x, y}
   */
  updateCanvasPosition(position) {
    if (typeof position.x === 'number' && typeof position.y === 'number') {
      this.canvasPosition = { ...position };
    }
  }

  /**
   * Update canvas size
   * @param {Object} size - New size {width, height}
   */
  updateCanvasSize(size) {
    if (typeof size.width === 'number' && typeof size.height === 'number' && 
        size.width > 0 && size.height > 0) {
      this.canvasSize = { ...size };
    }
  }

  /**
   * Update rotation angle
   * @param {number} angle - Rotation angle in degrees
   */
  updateRotation(angle) {
    if (typeof angle === 'number') {
      this.rotation = ((angle % 360) + 360) % 360;
    }
  }

  /**
   * Update set index for ordering
   * @param {number} index - New index position
   */
  updateSetIndex(index) {
    if (typeof index === 'number' && index >= 0) {
      this.setIndex = index;
    }
  }

  /**
   * Update caption text
   * @param {string} caption - New caption text
   */
  updateCaption(caption) {
    if (typeof caption === 'string') {
      this.caption = caption;
    }
  }

  /**
   * Validate the image data
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate() {
    const errors = [];
    
    if (!this.id || typeof this.id !== 'string' || this.id.trim() === '') {
      errors.push('ID is required and must be a string');
    }
    
    if (!this.url || typeof this.url !== 'string' || this.url.trim() === '') {
      errors.push('URL is required and must be a string');
    }
    
    if (typeof this.prompt !== 'string') {
      errors.push('Prompt must be a string');
    }
    
    if (typeof this.timestamp !== 'number' || this.timestamp <= 0) {
      errors.push('Timestamp must be a positive number');
    }
    
    if (typeof this.canvasPosition.x !== 'number' || typeof this.canvasPosition.y !== 'number') {
      errors.push('Canvas position must have numeric x and y coordinates');
    }
    
    if (typeof this.canvasSize.width !== 'number' || typeof this.canvasSize.height !== 'number' ||
        this.canvasSize.width <= 0 || this.canvasSize.height <= 0) {
      errors.push('Canvas size must have positive numeric width and height');
    }
    
    if (typeof this.rotation !== 'number') {
      errors.push('Rotation must be a number');
    }
    
    if (typeof this.setIndex !== 'number' || this.setIndex < 0) {
      errors.push('Set index must be a non-negative number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      url: this.url,
      prompt: this.prompt,
      timestamp: this.timestamp,
      metadata: this.metadata,
      canvasPosition: this.canvasPosition,
      canvasSize: this.canvasSize,
      rotation: this.rotation,
      setIndex: this.setIndex,
      caption: this.caption
    };
  }

  /**
   * Create instance from plain object
   * @param {Object} data - Plain object data
   * @returns {StoryboardImage} New instance
   */
  static fromJSON(data) {
    return new StoryboardImage(data);
  }
}

/**
 * Canvas layout model for SvelteFlow integration
 */
export class CanvasLayout {
  constructor(data = {}) {
    this.nodes = data.nodes || [];
    this.edges = data.edges || [];
    this.viewport = data.viewport || { x: 0, y: 0, zoom: 1 };
  }

  /**
   * Add a node to the canvas
   * @param {Object} node - SvelteFlow node object
   */
  addNode(node) {
    if (node && node.id) {
      const existingIndex = this.nodes.findIndex(n => n.id === node.id);
      if (existingIndex >= 0) {
        this.nodes[existingIndex] = node;
      } else {
        this.nodes.push(node);
      }
    }
  }

  /**
   * Remove a node from the canvas
   * @param {string} nodeId - ID of the node to remove
   */
  removeNode(nodeId) {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    // Also remove any edges connected to this node
    this.edges = this.edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    );
  }

  /**
   * Update node position
   * @param {string} nodeId - ID of the node to update
   * @param {Object} position - New position {x, y}
   */
  updateNodePosition(nodeId, position) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && typeof position.x === 'number' && typeof position.y === 'number') {
      node.position = { ...position };
    }
  }

  /**
   * Update viewport settings
   * @param {Object} viewport - New viewport {x, y, zoom}
   */
  updateViewport(viewport) {
    if (viewport && typeof viewport.x === 'number' && 
        typeof viewport.y === 'number' && typeof viewport.zoom === 'number') {
      this.viewport = { ...viewport };
    }
  }

  /**
   * Get node by ID
   * @param {string} nodeId - ID of the node
   * @returns {Object|null} Node object or null if not found
   */
  getNode(nodeId) {
    return this.nodes.find(node => node.id === nodeId) || null;
  }

  /**
   * Clear all nodes and edges
   */
  clear() {
    this.nodes = [];
    this.edges = [];
  }

  /**
   * Validate the canvas layout
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate() {
    const errors = [];
    
    if (!Array.isArray(this.nodes)) {
      errors.push('Nodes must be an array');
    }
    
    if (!Array.isArray(this.edges)) {
      errors.push('Edges must be an array');
    }
    
    if (!this.viewport || typeof this.viewport.x !== 'number' || 
        typeof this.viewport.y !== 'number' || typeof this.viewport.zoom !== 'number') {
      errors.push('Viewport must have numeric x, y, and zoom properties');
    }
    
    // Validate nodes have required properties
    this.nodes.forEach((node, index) => {
      if (!node.id || typeof node.id !== 'string') {
        errors.push(`Node at index ${index} must have a string ID`);
      }
      if (!node.position || typeof node.position.x !== 'number' || 
          typeof node.position.y !== 'number') {
        errors.push(`Node at index ${index} must have numeric position coordinates`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      nodes: this.nodes,
      edges: this.edges,
      viewport: this.viewport
    };
  }

  /**
   * Create instance from plain object
   * @param {Object} data - Plain object data
   * @returns {CanvasLayout} New instance
   */
  static fromJSON(data) {
    return new CanvasLayout(data);
  }
}

/**
 * Story chunk model for chunk-based storytelling
 */
export class StoryChunk {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.title = data.title || 'Untitled Chunk';
    this.description = data.description || '';
    this.images = data.images ? data.images.map(img =>
      img instanceof StoryboardImage ? img : new StoryboardImage(img)
    ) : [];
    this.connections = data.connections || []; // Connected chunk IDs
    this.chunkType = data.chunkType || 'sequence'; // 'sequence', 'choice', 'keyframe'
    this.position = data.position || { x: 0, y: 0 };
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  /**
   * Add an image to the chunk
   * @param {StoryboardImage} image - Image to add
   */
  addImage(image) {
    if (image instanceof StoryboardImage) {
      const existingIndex = this.images.findIndex(img => img.id === image.id);
      if (existingIndex >= 0) {
        this.images[existingIndex] = image;
      } else {
        this.images.push(image);
      }
      this.updateTimestamp();
    }
  }

  /**
   * Remove an image from the chunk
   * @param {string} imageId - ID of the image to remove
   */
  removeImage(imageId) {
    this.images = this.images.filter(img => img.id !== imageId);
    this.updateTimestamp();
  }

  /**
   * Add a connection to another chunk
   * @param {string} chunkId - ID of the chunk to connect to
   */
  addConnection(chunkId) {
    if (typeof chunkId === 'string' && !this.connections.includes(chunkId)) {
      this.connections.push(chunkId);
      this.updateTimestamp();
    }
  }

  /**
   * Remove a connection to another chunk
   * @param {string} chunkId - ID of the chunk to disconnect from
   */
  removeConnection(chunkId) {
    this.connections = this.connections.filter(id => id !== chunkId);
    this.updateTimestamp();
  }

  /**
   * Update chunk position
   * @param {Object} position - New position {x, y}
   */
  updatePosition(position) {
    if (typeof position.x === 'number' && typeof position.y === 'number') {
      this.position = { ...position };
      this.updateTimestamp();
    }
  }

  /**
   * Update the updatedAt timestamp
   */
  updateTimestamp() {
    this.updatedAt = Date.now();
  }

  /**
   * Validate the chunk data
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate() {
    const errors = [];

    if (!this.id || typeof this.id !== 'string' || this.id.trim() === '') {
      errors.push('Chunk ID is required and must be a string');
    }

    if (!this.title || typeof this.title !== 'string' || this.title.trim() === '') {
      errors.push('Chunk title is required and must be a string');
    }

    if (!Array.isArray(this.images)) {
      errors.push('Images must be an array');
    }

    if (!Array.isArray(this.connections)) {
      errors.push('Connections must be an array');
    }

    if (!['sequence', 'choice', 'keyframe'].includes(this.chunkType)) {
      errors.push('Chunk type must be sequence, choice, or keyframe');
    }

    if (!this.position || typeof this.position.x !== 'number' || typeof this.position.y !== 'number') {
      errors.push('Position must have numeric x and y coordinates');
    }

    // Validate each image
    this.images.forEach((image, index) => {
      if (!(image instanceof StoryboardImage)) {
        errors.push(`Image at index ${index} must be a StoryboardImage instance`);
      } else {
        const imageValidation = image.validate();
        if (!imageValidation.isValid) {
          errors.push(`Image at index ${index}: ${imageValidation.errors.join(', ')}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      images: this.images.map(img => img.toJSON()),
      connections: this.connections,
      chunkType: this.chunkType,
      position: this.position,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create instance from plain object
   * @param {Object} data - Plain object data
   * @returns {StoryChunk} New instance
   */
  static fromJSON(data) {
    return new StoryChunk(data);
  }
}

/**
 * Story connection model for linking chunks
 */
export class StoryConnection {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.sourceChunkId = data.sourceChunkId || '';
    this.targetChunkId = data.targetChunkId || '';
    this.connectionType = data.connectionType || 'sequence'; // 'sequence', 'choice', 'branch'
    this.label = data.label || '';
    this.condition = data.condition || null; // For conditional branching
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || Date.now();
  }

  /**
   * Validate the connection data
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate() {
    const errors = [];

    if (!this.id || typeof this.id !== 'string' || this.id.trim() === '') {
      errors.push('Connection ID is required and must be a string');
    }

    if (!this.sourceChunkId || typeof this.sourceChunkId !== 'string' || this.sourceChunkId.trim() === '') {
      errors.push('Source chunk ID is required and must be a string');
    }

    if (!this.targetChunkId || typeof this.targetChunkId !== 'string' || this.targetChunkId.trim() === '') {
      errors.push('Target chunk ID is required and must be a string');
    }

    if (!['sequence', 'choice', 'branch'].includes(this.connectionType)) {
      errors.push('Connection type must be sequence, choice, or branch');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      sourceChunkId: this.sourceChunkId,
      targetChunkId: this.targetChunkId,
      connectionType: this.connectionType,
      label: this.label,
      condition: this.condition,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }

  /**
   * Create instance from plain object
   * @param {Object} data - Plain object data
   * @returns {StoryConnection} New instance
   */
  static fromJSON(data) {
    return new StoryConnection(data);
  }
}

/**
 * Main project model containing all storyboard data
 */
export class StoryboardProject {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name !== undefined ? data.name : 'Untitled Storyboard';
    this.images = data.images ? data.images.map(img =>
      img instanceof StoryboardImage ? img : new StoryboardImage(img)
    ) : [];
    this.chunks = data.chunks ? data.chunks.map(chunk =>
      chunk instanceof StoryChunk ? chunk : new StoryChunk(chunk)
    ) : [];
    this.connections = data.connections ? data.connections.map(conn =>
      conn instanceof StoryConnection ? conn : new StoryConnection(conn)
    ) : [];
    this.canvasLayout = data.canvasLayout ?
      (data.canvasLayout instanceof CanvasLayout ? data.canvasLayout : new CanvasLayout(data.canvasLayout)) :
      new CanvasLayout();
    this.setOrder = data.setOrder || [];
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  /**
   * Add an image to the project
   * @param {StoryboardImage} image - Image to add
   */
  addImage(image) {
    if (image instanceof StoryboardImage) {
      const existingIndex = this.images.findIndex(img => img.id === image.id);
      if (existingIndex >= 0) {
        this.images[existingIndex] = image;
      } else {
        this.images.push(image);
        // Add to set order if not already present
        if (!this.setOrder.includes(image.id)) {
          this.setOrder.push(image.id);
        }
      }
      this.updateTimestamp();
    }
  }

  /**
   * Remove an image from the project
   * @param {string} imageId - ID of the image to remove
   */
  removeImage(imageId) {
    this.images = this.images.filter(img => img.id !== imageId);
    this.setOrder = this.setOrder.filter(id => id !== imageId);
    this.canvasLayout.removeNode(imageId);
    // Also remove from chunks
    this.chunks.forEach(chunk => chunk.removeImage(imageId));
    this.updateTimestamp();
  }

  /**
   * Add a chunk to the project
   * @param {StoryChunk} chunk - Chunk to add
   */
  addChunk(chunk) {
    if (chunk instanceof StoryChunk) {
      const existingIndex = this.chunks.findIndex(c => c.id === chunk.id);
      if (existingIndex >= 0) {
        this.chunks[existingIndex] = chunk;
      } else {
        this.chunks.push(chunk);
      }
      this.updateTimestamp();
    }
  }

  /**
   * Remove a chunk from the project
   * @param {string} chunkId - ID of the chunk to remove
   */
  removeChunk(chunkId) {
    this.chunks = this.chunks.filter(chunk => chunk.id !== chunkId);
    // Remove connections involving this chunk
    this.connections = this.connections.filter(conn =>
      conn.sourceChunkId !== chunkId && conn.targetChunkId !== chunkId
    );
    this.canvasLayout.removeNode(chunkId);
    this.updateTimestamp();
  }

  /**
   * Get a chunk by ID
   * @param {string} chunkId - ID of the chunk
   * @returns {StoryChunk|null} Chunk or null if not found
   */
  getChunk(chunkId) {
    return this.chunks.find(chunk => chunk.id === chunkId) || null;
  }

  /**
   * Add a connection between chunks
   * @param {StoryConnection} connection - Connection to add
   */
  addConnection(connection) {
    if (connection instanceof StoryConnection) {
      const existingIndex = this.connections.findIndex(c => c.id === connection.id);
      if (existingIndex >= 0) {
        this.connections[existingIndex] = connection;
      } else {
        this.connections.push(connection);
      }
      this.updateTimestamp();
    }
  }

  /**
   * Remove a connection
   * @param {string} connectionId - ID of the connection to remove
   */
  removeConnection(connectionId) {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
    this.updateTimestamp();
  }

  /**
   * Get connections for a specific chunk
   * @param {string} chunkId - ID of the chunk
   * @returns {StoryConnection[]} Array of connections
   */
  getChunkConnections(chunkId) {
    return this.connections.filter(conn =>
      conn.sourceChunkId === chunkId || conn.targetChunkId === chunkId
    );
  }

  /**
   * Get an image by ID
   * @param {string} imageId - ID of the image
   * @returns {StoryboardImage|null} Image or null if not found
   */
  getImage(imageId) {
    return this.images.find(img => img.id === imageId) || null;
  }

  /**
   * Update the project name
   * @param {string} name - New project name
   */
  updateName(name) {
    if (typeof name === 'string' && name.trim()) {
      this.name = name.trim();
      this.updateTimestamp();
    }
  }

  /**
   * Reorder images in set view
   * @param {string[]} newOrder - Array of image IDs in new order
   */
  reorderImages(newOrder) {
    if (Array.isArray(newOrder)) {
      // Validate that all IDs exist in the project
      const validIds = newOrder.filter(id => this.images.some(img => img.id === id));
      this.setOrder = validIds;
      
      // Update setIndex on each image
      this.images.forEach(image => {
        const newIndex = validIds.indexOf(image.id);
        if (newIndex >= 0) {
          image.updateSetIndex(newIndex);
        }
      });
      
      this.updateTimestamp();
    }
  }

  /**
   * Get images in set order
   * @returns {StoryboardImage[]} Ordered array of images
   */
  getOrderedImages() {
    return this.setOrder
      .map(id => this.getImage(id))
      .filter(img => img !== null);
  }

  /**
   * Clear all project data
   */
  clear() {
    this.images = [];
    this.canvasLayout.clear();
    this.setOrder = [];
    this.updateTimestamp();
  }

  /**
   * Update the updatedAt timestamp
   */
  updateTimestamp() {
    this.updatedAt = Date.now();
  }

  /**
   * Validate the project data
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate() {
    const errors = [];
    
    if (!this.id || typeof this.id !== 'string' || this.id.trim() === '') {
      errors.push('Project ID is required and must be a string');
    }
    
    if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
      errors.push('Project name is required and must be a string');
    }
    
    if (!Array.isArray(this.images)) {
      errors.push('Images must be an array');
    }

    if (!Array.isArray(this.chunks)) {
      errors.push('Chunks must be an array');
    }

    if (!Array.isArray(this.connections)) {
      errors.push('Connections must be an array');
    }

    if (!Array.isArray(this.setOrder)) {
      errors.push('Set order must be an array');
    }
    
    if (typeof this.createdAt !== 'number' || this.createdAt <= 0) {
      errors.push('Created timestamp must be a positive number');
    }
    
    if (typeof this.updatedAt !== 'number' || this.updatedAt <= 0) {
      errors.push('Updated timestamp must be a positive number');
    }
    
    // Validate each image
    this.images.forEach((image, index) => {
      if (!(image instanceof StoryboardImage)) {
        errors.push(`Image at index ${index} must be a StoryboardImage instance`);
      } else {
        const imageValidation = image.validate();
        if (!imageValidation.isValid) {
          errors.push(`Image at index ${index}: ${imageValidation.errors.join(', ')}`);
        }
      }
    });

    // Validate each chunk
    this.chunks.forEach((chunk, index) => {
      if (!(chunk instanceof StoryChunk)) {
        errors.push(`Chunk at index ${index} must be a StoryChunk instance`);
      } else {
        const chunkValidation = chunk.validate();
        if (!chunkValidation.isValid) {
          errors.push(`Chunk at index ${index}: ${chunkValidation.errors.join(', ')}`);
        }
      }
    });

    // Validate each connection
    this.connections.forEach((connection, index) => {
      if (!(connection instanceof StoryConnection)) {
        errors.push(`Connection at index ${index} must be a StoryConnection instance`);
      } else {
        const connectionValidation = connection.validate();
        if (!connectionValidation.isValid) {
          errors.push(`Connection at index ${index}: ${connectionValidation.errors.join(', ')}`);
        }

        // Validate that referenced chunks exist
        if (!this.chunks.some(chunk => chunk.id === connection.sourceChunkId)) {
          errors.push(`Connection at index ${index} references non-existent source chunk: ${connection.sourceChunkId}`);
        }
        if (!this.chunks.some(chunk => chunk.id === connection.targetChunkId)) {
          errors.push(`Connection at index ${index} references non-existent target chunk: ${connection.targetChunkId}`);
        }
      }
    });
    
    // Validate canvas layout
    const layoutValidation = this.canvasLayout.validate();
    if (!layoutValidation.isValid) {
      errors.push(`Canvas layout: ${layoutValidation.errors.join(', ')}`);
    }
    
    // Validate set order references existing images
    this.setOrder.forEach((id, index) => {
      if (!this.images.some(img => img.id === id)) {
        errors.push(`Set order at index ${index} references non-existent image ID: ${id}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      images: this.images.map(img => img.toJSON()),
      chunks: this.chunks.map(chunk => chunk.toJSON()),
      connections: this.connections.map(conn => conn.toJSON()),
      canvasLayout: this.canvasLayout.toJSON(),
      setOrder: this.setOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create instance from plain object
   * @param {Object} data - Plain object data
   * @returns {StoryboardProject} New instance
   */
  static fromJSON(data) {
    return new StoryboardProject(data);
  }
}