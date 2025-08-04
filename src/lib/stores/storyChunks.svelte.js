/**
 * Runes-based store for managing story chunks
 */
import { StoryChunk, StoryConnection } from '../types/storyboard.js';

/**
 * Story chunks store using SvelteKit 5 Runes
 */
function createStoryChunksStore() {
  let chunks = $state([]);
  let connections = $state([]);
  let selectedChunkId = $state(null);

  // Derived states
  const selectedChunk = $derived(() =>
    selectedChunkId ? chunks.find(chunk => chunk.id === selectedChunkId) : null
  );

  const chunkCount = $derived(() => chunks.length);

  const connectionCount = $derived(() => connections.length);

  // Get chunks by type
  const sequenceChunks = $derived(() =>
    chunks.filter(chunk => chunk.chunkType === 'sequence')
  );

  const choiceChunks = $derived(() =>
    chunks.filter(chunk => chunk.chunkType === 'choice')
  );

  const keyframeChunks = $derived(() =>
    chunks.filter(chunk => chunk.chunkType === 'keyframe')
  );

  /**
   * Add a new chunk
   * @param {Object} chunkData - Data for the new chunk
   * @returns {StoryChunk} The created chunk
   */
  function addChunk(chunkData = {}) {
    const chunk = new StoryChunk(chunkData);
    chunks.push(chunk);
    return chunk;
  }

  /**
   * Remove a chunk and its connections
   * @param {string} chunkId - ID of the chunk to remove
   */
  function removeChunk(chunkId) {
    chunks = chunks.filter(chunk => chunk.id !== chunkId);
    connections = connections.filter(conn =>
      conn.sourceChunkId !== chunkId && conn.targetChunkId !== chunkId
    );

    if (selectedChunkId === chunkId) {
      selectedChunkId = null;
    }
  }

  /**
   * Update a chunk
   * @param {string} chunkId - ID of the chunk to update
   * @param {Object} updates - Updates to apply
   */
  function updateChunk(chunkId, updates) {
    const chunk = chunks.find(c => c.id === chunkId);
    if (chunk) {
      Object.assign(chunk, updates);
      chunk.updateTimestamp();
    }
  }

  /**
   * Get a chunk by ID
   * @param {string} chunkId - ID of the chunk
   * @returns {StoryChunk|null} The chunk or null if not found
   */
  function getChunk(chunkId) {
    return chunks.find(chunk => chunk.id === chunkId) || null;
  }

  /**
   * Select a chunk
   * @param {string|null} chunkId - ID of the chunk to select, or null to deselect
   */
  function selectChunk(chunkId) {
    selectedChunkId = chunkId;
  }

  /**
   * Add a connection between chunks
   * @param {Object} connectionData - Data for the new connection
   * @returns {StoryConnection} The created connection
   */
  function addConnection(connectionData) {
    const connection = new StoryConnection(connectionData);
    connections.push(connection);

    // Also update the source chunk's connections array
    const sourceChunk = getChunk(connection.sourceChunkId);
    if (sourceChunk) {
      sourceChunk.addConnection(connection.targetChunkId);
    }

    return connection;
  }

  /**
   * Remove a connection
   * @param {string} connectionId - ID of the connection to remove
   */
  function removeConnection(connectionId) {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      // Update the source chunk's connections array
      const sourceChunk = getChunk(connection.sourceChunkId);
      if (sourceChunk) {
        sourceChunk.removeConnection(connection.targetChunkId);
      }

      connections = connections.filter(c => c.id !== connectionId);
    }
  }

  /**
   * Get connections for a specific chunk
   * @param {string} chunkId - ID of the chunk
   * @returns {StoryConnection[]} Array of connections
   */
  function getChunkConnections(chunkId) {
    return connections.filter(conn =>
      conn.sourceChunkId === chunkId || conn.targetChunkId === chunkId
    );
  }

  /**
   * Get outgoing connections from a chunk
   * @param {string} chunkId - ID of the chunk
   * @returns {StoryConnection[]} Array of outgoing connections
   */
  function getOutgoingConnections(chunkId) {
    return connections.filter(conn => conn.sourceChunkId === chunkId);
  }

  /**
   * Get incoming connections to a chunk
   * @param {string} chunkId - ID of the chunk
   * @returns {StoryConnection[]} Array of incoming connections
   */
  function getIncomingConnections(chunkId) {
    return connections.filter(conn => conn.targetChunkId === chunkId);
  }

  /**
   * Build story tree structure for visualization
   * @returns {Object} Tree structure with nodes and edges
   */
  function buildStoryTree() {
    const nodes = chunks.map(chunk => ({
      id: chunk.id,
      type: 'chunk',
      data: {
        chunk,
        title: chunk.title,
        description: chunk.description,
        chunkType: chunk.chunkType,
        imageCount: chunk.images.length
      },
      position: chunk.position
    }));

    const edges = connections.map(connection => ({
      id: connection.id,
      source: connection.sourceChunkId,
      target: connection.targetChunkId,
      type: connection.connectionType,
      data: {
        connection,
        label: connection.label
      }
    }));

    return { nodes, edges };
  }

  /**
   * Clear all chunks and connections
   */
  function clear() {
    chunks = [];
    connections = [];
    selectedChunkId = null;
  }

  /**
   * Load chunks and connections from data
   * @param {Object} data - Data containing chunks and connections
   */
  function loadFromData(data) {
    chunks = (data.chunks || []).map(chunkData =>
      chunkData instanceof StoryChunk ? chunkData : new StoryChunk(chunkData)
    );
    connections = (data.connections || []).map(connData =>
      connData instanceof StoryConnection ? connData : new StoryConnection(connData)
    );
    selectedChunkId = null;
  }

  /**
   * Export chunks and connections to plain objects
   * @returns {Object} Plain object representation
   */
  function exportData() {
    return {
      chunks: chunks.map(chunk => chunk.toJSON()),
      connections: connections.map(conn => conn.toJSON())
    };
  }

  /**
   * Validate all chunks and connections
   * @returns {Object} Validation result
   */
  function validate() {
    const errors = [];

    // Validate chunks
    chunks.forEach((chunk, index) => {
      const validation = chunk.validate();
      if (!validation.isValid) {
        errors.push(`Chunk ${index}: ${validation.errors.join(', ')}`);
      }
    });

    // Validate connections
    connections.forEach((connection, index) => {
      const validation = connection.validate();
      if (!validation.isValid) {
        errors.push(`Connection ${index}: ${validation.errors.join(', ')}`);
      }

      // Check if referenced chunks exist
      if (!chunks.some(chunk => chunk.id === connection.sourceChunkId)) {
        errors.push(`Connection ${index}: Source chunk ${connection.sourceChunkId} not found`);
      }
      if (!chunks.some(chunk => chunk.id === connection.targetChunkId)) {
        errors.push(`Connection ${index}: Target chunk ${connection.targetChunkId} not found`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  return {
    // State
    get chunks() { return chunks; },
    get connections() { return connections; },
    get selectedChunkId() { return selectedChunkId; },

    // Derived
    get selectedChunk() { return selectedChunk; },
    get chunkCount() { return chunkCount; },
    get connectionCount() { return connectionCount; },
    get sequenceChunks() { return sequenceChunks; },
    get choiceChunks() { return choiceChunks; },
    get keyframeChunks() { return keyframeChunks; },

    // Methods
    addChunk,
    removeChunk,
    updateChunk,
    getChunk,
    selectChunk,
    addConnection,
    removeConnection,
    getChunkConnections,
    getOutgoingConnections,
    getIncomingConnections,
    buildStoryTree,
    clear,
    loadFromData,
    exportData,
    validate
  };
}

// Create and export the store instance
export const storyChunksStore = createStoryChunksStore();
