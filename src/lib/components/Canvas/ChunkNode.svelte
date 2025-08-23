<!-- ChunkNode.svelte - src/lib/components/Canvas/ChunkNode.svelte -->
<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';

	// Props from SvelteFlow using Svelte 5 $props()
	let { data, id, selected = false, dragging = false } = $props();

	// Reactive chunk styling based on type using Svelte 5 $derived()
	let chunkStyle = $derived(getChunkStyle(data?.type));
	let typeIcon = $derived(getTypeIcon(data?.type));
	let connectionColor = $derived(getConnectionColor(data?.type));

	function getChunkStyle(type) {
		const baseStyle = {
			borderColor: '#3f3f46',
			shadowColor: 'rgba(63, 63, 70, 0.3)'
		};

		switch(type) {
			case 'sequence':
				return {
					borderColor: '#22c55e',  /* Zinc green */
					shadowColor: 'rgba(34, 197, 94, 0.3)'
				};
			case 'choice':
				return {
					borderColor: '#f59e0b',  /* Zinc amber */
					shadowColor: 'rgba(245, 158, 11, 0.3)'
				};
			case 'keyframe':
				return {
					borderColor: '#06b6d4',  /* Zinc cyan */
					shadowColor: 'rgba(6, 182, 212, 0.3)'
				};
			default:
				return baseStyle;
		}
	}

	function getTypeIcon(type) {
		switch(type) {
			case 'sequence': return '📺';
			case 'choice': return '🔀'; 
			case 'keyframe': return '🎯';
			default: return '📝';
		}
	}

	function getConnectionColor(type) {
		switch(type) {
			case 'sequence': return '#22c55e';  /* Zinc green */
			case 'choice': return '#f59e0b';   /* Zinc amber */
			case 'keyframe': return '#06b6d4'; /* Zinc cyan */
			default: return '#3f3f46';          /* Zinc 700 */
		}
	}

	// Handle node interactions
	function handleNodeClick(event) {
		// Prevent default to avoid SvelteFlow selection issues
		event.stopPropagation();
	}

	function handleNodeDoubleClick(event) {
		event.stopPropagation();
		// Could trigger edit mode here
		console.log('Edit chunk:', id);
	}

	function handleContextMenu(event) {
		event.preventDefault();
		// Could show context menu here
		console.log('Context menu for chunk:', id);
	}
</script>

<div
	class="chunk-node"
	class:selected
	class:dragging
	style:--border-color={chunkStyle.borderColor}
	style:--shadow-color={chunkStyle.shadowColor}
	style:--connection-color={connectionColor}
	onclick={handleNodeClick}
	ondblclick={handleNodeDoubleClick}
	oncontextmenu={handleContextMenu}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleNodeClick(e);
		} else if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			// Handle delete if there's a delete function
		}
	}}
	role="button"
	tabindex="0"
>
	<!-- Input/Output Indicators -->
	<div class="io-indicator io-input">
		<div class="io-label">IN</div>
		<div class="io-connector" style="background: {connectionColor};"></div>
	</div>

	<!-- Connection Handles -->
	<Handle
		type="target"
		position={Position.Left}
		class="chunk-handle chunk-handle-left"
		style="background: {connectionColor};"
		id="target-handle"
	/>
	<Handle
		type="source"
		position={Position.Right}
		class="chunk-handle chunk-handle-right"
		style="background: {connectionColor};"
		id="source-handle"
	/>

	<!-- Output Indicator -->
	<div class="io-indicator io-output">
		<div class="io-connector" style="background: {connectionColor};"></div>
		<div class="io-label">OUT</div>
	</div>

	<!-- Chunk Header -->
	<div class="chunk-header">
		<div class="chunk-type">
			<span class="type-icon">{typeIcon}</span>
			<span class="type-label">{data?.type || 'chunk'}</span>
		</div>
		
		{#if selected}
			<div class="selection-indicator">✓</div>
		{/if}
	</div>
	
	<!-- Chunk Content -->
	<div class="chunk-content">
		<div class="chunk-title">
			{data?.title || 'Untitled Chunk'}
		</div>
		
		{#if data?.description}
			<div class="chunk-description">
				{data.description}
			</div>
		{/if}

		{#if data?.hasImage}
			<div class="chunk-image-placeholder">
				<div class="image-icon">🖼️</div>
				<div class="image-text">AI Generated Image</div>
			</div>
		{/if}

		{#if data?.metadata}
			<div class="chunk-metadata">
				<div class="metadata-item">
					<span class="metadata-key">Duration:</span>
					<span class="metadata-value">{data.metadata.duration || '5s'}</span>
				</div>
				{#if data.metadata.characters}
					<div class="metadata-item">
						<span class="metadata-key">Characters:</span>
						<span class="metadata-value">{data.metadata.characters}</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Chunk Footer -->
	{#if data?.tags && data.tags.length > 0}
		<div class="chunk-footer">
			{#each data.tags as tag}
				<span class="chunk-tag">{tag}</span>
			{/each}
		</div>
	{/if}

	<!-- Connection Indicator for Choice nodes -->
	{#if data?.type === 'choice' && data?.choices}
		<div class="choice-indicator">
			{data.choices.length} paths
		</div>
	{/if}
</div>

<style>
	.chunk-node {
		background: #09090b;
		border: 2px solid var(--border-color);
		border-radius: 12px;
		padding: 0;
		min-width: 220px;
		max-width: 300px;
		color: #fafaf9;
		font-family: 'Inter', system-ui, sans-serif;
		box-shadow: 0 4px 12px var(--shadow-color);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: grab;
		position: relative;
		overflow: hidden;
	}

	.chunk-node:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px var(--shadow-color);
	}

	.chunk-node.selected {
		border-width: 3px;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 8px 20px var(--shadow-color);
	}

	.chunk-node.dragging {
		cursor: grabbing;
		transform: rotate(2deg);
		box-shadow: 0 12px 24px var(--shadow-color);
	}

	/* Input/Output Indicators */
	.io-indicator {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		z-index: 10;
	}

	.io-input {
		left: -40px;
		flex-direction: row-reverse;
	}

	.io-output {
		right: -40px;
	}

	.io-label {
		color: #a1a1aa;
		background: #1c1917;
		padding: 2px 4px;
		border-radius: 3px;
		border: 1px solid #292524;
	}

	.io-connector {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid #292524;
		position: relative;
	}

	.io-connector::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}

	/* Connection Handles */
	:global(.chunk-handle) {
		width: 18px !important;
		height: 18px !important;
		border: 3px solid #292524 !important;
		border-radius: 50% !important;
		transition: all 0.2s !important;
		cursor: crosshair !important;
		z-index: 100 !important;
	}

	:global(.chunk-handle:hover) {
		width: 22px !important;
		height: 22px !important;
		border-width: 4px !important;
		box-shadow: 0 0 10px currentColor !important;
	}

	:global(.chunk-handle-left) {
		left: -9px !important;
	}

	:global(.chunk-handle-right) {
		right: -9px !important;
	}

	:global(.chunk-handle:hover) {
		transform: scale(1.2) !important;
		border-color: #ffffff !important;
		box-shadow: 0 0 8px var(--connection-color) !important;
	}

	/* Chunk Header */
	.chunk-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px 8px;
		border-bottom: 1px solid #292524;
		background: rgba(41, 37, 36, 0.3);
	}

	.chunk-type {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.type-icon {
		font-size: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.type-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #a1a1aa;
	}

	.selection-indicator {
		background: #22c55e;
		color: white;
		font-size: 10px;
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 50%;
		min-width: 16px;
		text-align: center;
	}

	/* Chunk Content */
	.chunk-content {
		padding: 16px;
	}

	.chunk-title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.3;
		margin-bottom: 8px;
		color: #fafaf9;
	}

	.chunk-description {
		font-size: 12px;
		line-height: 1.4;
		color: #e4e4e7;
		margin-bottom: 12px;
	}

	.chunk-image-placeholder {
		background: #292524;
		border-radius: 6px;
		padding: 16px;
		text-align: center;
		margin-bottom: 12px;
		border: 1px dashed #3f3f46;
		transition: all 0.2s;
	}

	.chunk-image-placeholder:hover {
		background: #3f3f46;
		border-color: var(--border-color);
	}

	.image-icon {
		font-size: 24px;
		margin-bottom: 4px;
	}

	.image-text {
		font-size: 10px;
		color: #a1a1aa;
		font-weight: 500;
	}

	.chunk-metadata {
		display: grid;
		gap: 4px;
		margin-top: 8px;
	}

	.metadata-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
	}

	.metadata-key {
		color: #a1a1aa;
		font-weight: 500;
	}

	.metadata-value {
		color: #e4e4e7;
		background: #292524;
		padding: 2px 6px;
		border-radius: 3px;
		font-weight: 600;
	}

	/* Chunk Footer */
	.chunk-footer {
		padding: 8px 16px 12px;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		border-top: 1px solid #292524;
		background: rgba(41, 37, 36, 0.2);
	}

	.chunk-tag {
		background: var(--border-color);
		color: #ffffff;
		font-size: 9px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Choice Indicator */
	.choice-indicator {
		position: absolute;
		top: -8px;
		right: 12px;
		background: #f59e0b;
		color: #000000;
		font-size: 9px;
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.chunk-node {
			min-width: 180px;
			max-width: 250px;
		}
		
		.chunk-content {
			padding: 12px;
		}
		
		.chunk-title {
			font-size: 13px;
		}
		
		.chunk-description {
			font-size: 11px;
		}
	}
</style>