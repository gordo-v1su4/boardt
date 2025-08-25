# Linear API Integration for Boardt

This document outlines the integration between Boardt's canvas system and Linear, providing task tracking and progress synchronization capabilities.

## Overview

The Linear integration allows users to:

1. Create Linear issues from Boardt chunks
2. Update Boardt chunks with changes from Linear
3. Perform two-way synchronization between Boardt and Linear
4. Create a structured Boardt project in Linear with predefined issue hierarchy

## Configuration

### Setup

The Linear integration requires:
- A Linear API key
- A team ID from Linear

Configuration is stored in the `linearConfig` Svelte store and managed through the `LinearConfig` component.

```typescript
// Configuration stored in linearConfig store
interface LinearConfig {
  enabled: boolean;
  apiKey: string;
  teamId: string;
  lastSyncedAt: string | null;
}
```

## Key Components

### 1. MCP Utilities

The Model Context Protocol (MCP) utility functions handle communication with Linear's API:

- **`useMcpTool.ts`**: Core utility for API communication
- **`types.ts`**: TypeScript interfaces for Linear data structures

### 2. Linear Service

The `LinearService` class (`linearService.ts`) provides direct API operations:

- Fetching issues from Linear
- Creating new issues in Linear
- Updating existing issues
- Managing issue states and properties

### 3. Synchronization Service

The `LinearSyncService` class (`syncService.ts`) handles two-way synchronization:

- `createIssueFromChunk`: Creates a Linear issue from a Boardt chunk
- `updateIssueFromChunk`: Updates a Linear issue with changes from a Boardt chunk
- `syncFromLinear`: Updates Boardt chunks with changes from Linear
- `syncAll`: Performs bidirectional synchronization

### 4. Project Creation

The `createBoardtProject` function (`createProjectAndIssues.ts`) sets up a structured project in Linear:

- Creates a new project with the Boardt naming convention
- Establishes a hierarchical issue structure (BOA-XX-YYY format)
- Major tasks use XX format (e.g., BOA-01, BOA-02)
- Subtasks use YYY format (e.g., BOA-01-001, BOA-01-002)

### 5. UI Components

- **`LinearConfig.svelte`**: Configuration UI for Linear settings
- **`LinearIntegrationPanel.svelte`**: Canvas integration panel for interacting with Linear
- **`ChunkNode.svelte`**: Enhanced to display Linear issue information

## Integration Panel

The Linear Integration Panel provides four key operations:

1. **Push to Linear**: Create or update Linear issues for selected nodes
2. **Pull from Linear**: Update nodes with changes from Linear
3. **Two-way Sync**: Synchronize both directions
4. **Create Boardt Project**: Set up a Linear project with Boardt issue structure

## Project Structure Creation

The "Create Boardt Project" feature establishes a standardized project in Linear with the following structure:

```
BOA-01: Major Task 1
  BOA-01-001: Subtask 1
  BOA-01-002: Subtask 2
  BOA-01-003: Subtask 3

BOA-02: Major Task 2
  BOA-02-001: Subtask 1
  BOA-02-002: Subtask 2
  ...
```

This structure allows for:
- Clear hierarchy of tasks
- Consistent naming convention
- Easy tracking of related tasks
- Improved organization in both Linear and Boardt

## Usage Examples

### Creating Linear Issues from Chunks

```javascript
// Select nodes in the canvas
const selectedNodes = [/* ... */];

// Create issues for selected nodes
await LinearSyncService.createIssueFromChunk(nodeId);
```

### Syncing from Linear

```javascript
// Pull all updates from Linear
await LinearSyncService.syncFromLinear();
```

### Creating a Boardt Project

```javascript
// Set up a structured Boardt project in Linear
const project = await createBoardtProject();
```

## Best Practices

1. Configure the Linear integration with a valid API key and team ID before use
2. Regularly sync to keep Boardt and Linear in alignment
3. Use the hierarchical issue structure for better organization
4. Update Linear issue states to reflect progress in your Boardt canvas