<!-- +page.svelte - Main Boardt Canvas Demo -->
<script lang="ts">
	import { onMount } from 'svelte';
	import {
		SvelteFlow,
		SvelteFlowProvider,
		Controls,
		Background,
		MiniMap,
		useSvelteFlow,
		MarkerType
	} from '@xyflow/svelte';
	import ChunkNode from '$lib/components/Canvas/ChunkNode.svelte';
	import ChunkEdge from '$lib/components/Canvas/ChunkEdge.svelte';
	import ChunkCreator from '$lib/components/Canvas/ChunkCreator.svelte';
	import KeyframeInserter from '$lib/components/Canvas/KeyframeInserter.svelte';
	
	// Svelte 5 Runes for state management
	let nodes = $state([
		{
			id: '1',
			type: 'chunk',
			position: { x: 100, y: 100 },
			data: {
				type: 'sequence',
				title: 'Opening Scene',
				description: 'Our hero enters the mysterious forest, unaware of the dangers ahead.',
				hasImage: true
			},
			selected: false
		},
		{
			id: '2',
			type: 'chunk',
			position: { x: 400, y: 100 },
			data: {
				type: 'choice',
				title: 'The Fork in the Road',
				description: 'Two paths diverge - one leads to the village, the other deeper into darkness.',
				hasImage: true
			},
			selected: false
		},
		{
			id: '3',
			type: 'chunk',
			position: { x: 650, y: 50 },
			data: {
				type: 'sequence',
				title: 'Village Path',
				description: 'The safe route leads to a peaceful village with friendly inhabitants.',
				hasImage: false
			},
			selected: false
		},
		{
			id: '4',
			type: 'chunk',
			position: { x: 650, y: 200 },
			data: {
				type: 'keyframe',
				title: 'Dark Forest',
				description: 'The dangerous path reveals ancient secrets and hidden treasures.',
				hasImage: true
			},
			selected: false
		}
	]);

		let edges = $state([
		{
			id: 'e1-2',
			source: '1',
			target: '2',
			type: 'chunk',
			data: { type: 'sequence' },
			markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
			selected: false
		},
		{
			id: 'e2-3',
			source: '2',
			target: '3',
			type: 'chunk',
			data: { type: 'choice' },
			markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
			selected: false
		},
		{
			id: 'e2-4',
			source: '2',
			target: '4',
			type: 'chunk',
			data: { type: 'branch' },
			markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
			selected: false
		}
	]);

	let showCreateModal = $state(false);
	let selectedNodes = $state([]);
	let selectedEdges = $state([]);

	// Derived state for canvas stats
	let canvasStats = $derived({
		nodeCount: nodes.length,
		edgeCount: edges.length,
		sequenceNodes: nodes.filter(n => n.data?.type === 'sequence').length,
		choiceNodes: nodes.filter(n => n.data?.type === 'choice').length,
		keyframeNodes: nodes.filter(n => n.data?.type === 'keyframe').length
	});

	// Node types for SvelteFlow
	const nodeTypes = {
		chunk: ChunkNode
	};

		// Edge types for SvelteFlow
	const edgeTypes = {
		chunk: ChunkEdge
	} as any;



	// Event handlers (simplified for now)
	function onConnect(connection) {
		console.log('Connection made:', connection);
		// Create new connection
		const newEdge = {
			id: `e${connection.source}-${connection.target}`,
			source: connection.source,
			target: connection.target,
			type: 'chunk',
			data: { type: 'sequence' },
			markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
			selected: false
		};
		edges = [...edges, newEdge];
		console.log('New edge added:', newEdge);
	}

	// Canvas actions
	function createSampleData() {
				nodes = [
			{
				id: '1',
				type: 'chunk',
				position: { x: 100, y: 100 },
				data: {
					type: 'sequence',
					title: 'Opening Scene',
					description: 'Our hero enters the mysterious forest, unaware of the dangers ahead.',
					hasImage: true
				},
				selected: false
			},
			{
				id: '2',
				type: 'chunk',
				position: { x: 400, y: 100 },
				data: {
					type: 'choice',
					title: 'The Fork in the Road',
					description: 'Two paths diverge - one leads to the village, the other deeper into darkness.',
					hasImage: true
				},
				selected: false
			},
			{
				id: '3',
				type: 'chunk',
				position: { x: 650, y: 50 },
				data: {
					type: 'sequence',
					title: 'Village Path',
					description: 'The safe route leads to a peaceful village with friendly inhabitants.',
					hasImage: false
				},
				selected: false
			},
			{
				id: '4',
				type: 'chunk',
				position: { x: 650, y: 200 },
				data: {
					type: 'keyframe',
					title: 'Dark Forest',
					description: 'The dangerous path reveals ancient secrets and hidden treasures.',
					hasImage: true
				},
				selected: false
			}
		];

		edges = [
			{
				id: 'e1-2',
				source: '1',
				target: '2',
				type: 'chunk',
				data: { type: 'sequence' },
				markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
				selected: false
			},
			{
				id: 'e2-3',
				source: '2',
				target: '3',
				type: 'chunk',
				data: { type: 'choice' },
				markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
				selected: false
			},
			{
				id: 'e2-4',
				source: '2',
				target: '4',
				type: 'chunk',
				data: { type: 'branch' },
				markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
				selected: false
			}
		];
	}

	function clearCanvas() {
		nodes = [];
		edges = [];
	}

	function deleteSelected() {
		const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
		const selectedEdgeIds = edges.filter(e => e.selected).map(e => e.id);
		
		// Remove selected nodes and their connected edges
		nodes = nodes.filter(n => !n.selected);
		edges = edges.filter(e => 
			!e.selected && 
			!selectedNodeIds.includes(e.source) && 
			!selectedNodeIds.includes(e.target)
		);
	}

	function selectAll() {
		nodes = nodes.map(n => ({ ...n, selected: true }));
		edges = edges.map(e => ({ ...e, selected: true }));
	}

	function resetZoom() {
		// Zoom and fit functionality will be handled by SvelteFlow's built-in controls
		console.log('Reset zoom requested');
	}

	// Keyboard shortcuts
	function handleKeydown(event) {
		// Delete selected elements
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			deleteSelected();
		}
		
		// Keyboard shortcuts with Ctrl/Cmd
		if (event.ctrlKey || event.metaKey) {
			switch(event.key) {
				case '0':
					event.preventDefault();
					resetZoom();
					break;
				case 'a':
					event.preventDefault();
					selectAll();
					break;
				case '+':
				case '=':
					event.preventDefault();
					console.log('Zoom in requested');
					break;
				case '-':
					event.preventDefault();
					console.log('Zoom out requested');
					break;
			}
		}
	}

	// Handle chunk creation
	function handleCreateChunk(chunkData) {
		const newNode = {
			id: `chunk-${Date.now()}`,
			type: 'chunk',
			position: {
				x: Math.random() * 400 + 200,
				y: Math.random() * 300 + 150
			},
			data: chunkData,
			selected: false
		};
		nodes = [...nodes, newNode];
		showCreateModal = false;
	}

	onMount(() => {
		// Setup keyboard listeners
		window.addEventListener('keydown', handleKeydown);
		
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:head>
	<title>Boardt - AI Storyboard Generator</title>
	<style>
		/* Global SvelteFlow CSS imports */
		@import '@xyflow/svelte/dist/style.css';
	</style>
</svelte:head>

<main class="canvas-container">
	<SvelteFlowProvider>
		<SvelteFlow
			{nodes}
			{edges}
			{nodeTypes}
			{edgeTypes}
			onconnect={onConnect}
			fitView={true}
			snapGrid={[20, 20]}
			minZoom={0.1}
			maxZoom={2}
			class="dark-flow"
			nodesConnectable={true}
			elementsSelectable={true}
		>
			<Background gap={20} />
			<Controls />
			<MiniMap nodeColor="#22c55e" maskColor="rgba(9, 9, 11, 0.8)" pannable zoomable />

			<!-- Debug Panel -->
			<div class="debug-panel">
				<button class="btn btn-success" onclick={createSampleData}>
					Create Sample Data
				</button>
				<button class="btn btn-primary" onclick={() => showCreateModal = true}>
					Create Chunk
				</button>
				<button class="btn btn-warning" onclick={() => console.log('Current nodes:', nodes, 'Current edges:', edges)}>
					Debug Connections
				</button>
				<button class="btn btn-danger" onclick={clearCanvas}>
					Clear Canvas
				</button>
				<button class="btn btn-secondary" onclick={resetZoom}>
					Reset View
				</button>
			</div>

			<!-- Stats Panel -->
			<div class="stats-panel">
				<h3>Canvas Statistics</h3>
				<div class="stats-grid">
					<div class="stat-item">
						<span class="stat-label">Total Chunks:</span>
						<span class="stat-value">{canvasStats.nodeCount}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Connections:</span>
						<span class="stat-value">{canvasStats.edgeCount}</span>
					</div>
					<div class="stat-item sequence">
						<span class="stat-label">📺 Sequences:</span>
						<span class="stat-value">{canvasStats.sequenceNodes}</span>
					</div>
					<div class="stat-item choice">
						<span class="stat-label">🔀 Choices:</span>
						<span class="stat-value">{canvasStats.choiceNodes}</span>
					</div>
					<div class="stat-item keyframe">
						<span class="stat-label">🎯 Keyframes:</span>
						<span class="stat-value">{canvasStats.keyframeNodes}</span>
					</div>
				</div>

				<div class="help-text">
					<strong>Controls:</strong><br/>
					• Drag chunks to move<br/>
					• Connect handles to link<br/>
					• Delete/Backspace: Remove<br/>
					• Ctrl+A: Select all<br/>
					• Ctrl+0: Reset zoom<br/>
					• Mouse wheel: Zoom
				</div>
			</div>
		</SvelteFlow>
	</SvelteFlowProvider>

	<!-- Chunk Creator Modal -->
	{#if showCreateModal}
		<ChunkCreator
			onClose={() => showCreateModal = false}
			onCreate={handleCreateChunk}
		/>
	{/if}

	<!-- Keyframe Inserter Modal -->
	<KeyframeInserter />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #0f0f0f;
		font-family: 'Inter', system-ui, sans-serif;
		overflow: hidden;
	}

	.canvas-container {
		width: 100vw;
		height: 100vh;
		background: #09090b !important;
	}

	/* SvelteFlow Dark Theme - Zinc/Stone Palette */
	:global(.svelte-flow) {
		background: #09090b !important;
	}

	:global(.dark-flow) {
		background: #09090b !important;
	}

	:global(.svelte-flow__viewport) {
		background: #09090b !important;
	}

	:global(.svelte-flow__pane) {
		background: #09090b !important;
	}

	:global(.svelte-flow__node) {
		background: transparent !important;
	}

	:global(.svelte-flow__edge-path) {
		stroke: #22c55e !important;
	}

	:global(.svelte-flow__edge.selected .svelte-flow__edge-path) {
		stroke: #f59e0b !important;
	}

		:global(.dark-flow .svelte-flow__controls) {
			background: #1c1917;
			border: 1px solid #292524;
			border-radius: 8px;
		}

		:global(.dark-flow .svelte-flow__controls button) {
			background: #292524;
			border: 1px solid #3f3f46;
			color: #e4e4e7;
		}

		:global(.dark-flow .svelte-flow__controls button:hover) {
			background: #3f3f46;
		}

		:global(.dark-flow .svelte-flow__minimap) {
			background: #1c1917;
			border: 1px solid #292524;
			border-radius: 8px;
		}

	/* Debug Panel */
	.debug-panel {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 10;
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		background: #1c1917;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid #292524;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	/* Stats Panel */
	.stats-panel {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 10;
		background: #1c1917;
		padding: 16px;
		border-radius: 8px;
		border: 1px solid #292524;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		color: #e4e4e7;
		min-width: 200px;
		font-size: 12px;
	}

	.stats-panel h3 {
		margin: 0 0 12px 0;
		color: #fafaf9;
		font-size: 14px;
	}

	.stats-grid {
		display: grid;
		gap: 6px;
		margin-bottom: 12px;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 0;
	}

	.stat-item.sequence { color: #22c55e; }  /* Zinc green */
	.stat-item.choice { color: #f59e0b; }     /* Zinc amber */
	.stat-item.keyframe { color: #06b6d4; }   /* Zinc cyan */

	.stat-label {
		font-weight: 500;
	}

	.stat-value {
		background: #292524;
		padding: 2px 6px;
		border-radius: 4px;
		font-weight: bold;
	}

	.help-text {
		padding-top: 12px;
		border-top: 1px solid #292524;
		line-height: 1.4;
		color: #a1a1aa;
	}

	/* Button Styles - Zinc/Stone Palette */
	.btn {
		padding: 6px 12px;
		border: none;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #22c55e;  /* Zinc green */
		color: white;
	}

	.btn-primary:hover {
		background: #16a34a;
	}

	.btn-success {
		background: #06b6d4;  /* Zinc cyan */
		color: white;
	}

	.btn-success:hover {
		background: #0891b2;
	}

	.btn-danger {
		background: #ef4444;  /* Zinc red */
		color: white;
	}

	.btn-danger:hover {
		background: #dc2626;
	}

	.btn-secondary {
		background: #3f3f46;  /* Zinc 700 */
		color: white;
	}

	.btn-secondary:hover {
		background: #52525b;
	}

	.btn-warning {
		background: #f59e0b;  /* Zinc amber */
		color: white;
	}

	.btn-warning:hover {
		background: #d97706;
	}
</style>