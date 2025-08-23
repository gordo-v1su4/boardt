<!-- ChunkEdge.svelte - src/lib/components/Canvas/ChunkEdge.svelte -->
<script lang="ts">
	import { getBezierPath } from '@xyflow/svelte';
	import { uiStore } from '../../stores/ui.svelte.js';
	import { storyChunksStore } from '../../stores/storyChunks.svelte.js';

	// Props from SvelteFlow using Svelte 5 $props()
	let {
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		data = {},
		selected = false,
		style = {}
	} = $props();

	// Calculate the bezier path using Svelte 5 $derived()
	let [edgePath, labelX, labelY] = $derived(getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	}));

	// Get edge styling based on connection type using Svelte 5 $derived()
	let edgeStyle = $derived(getEdgeStyle(data?.type || data?.connectionType || 'sequence'));
	let connectionType = $derived(data?.connectionType || data?.type || 'sequence');
	let connectionLabel = $derived(data?.label || '');
	let isSelected = $derived(selected || uiStore.isSelected(id));
	let hasAnimation = $derived(connectionType === 'choice' || connectionType === 'branch');

	function getEdgeStyle(type) {
		const baseStyle = {
			stroke: '#3f3f46',
			strokeWidth: 2,
			strokeDasharray: 'none'
		};

		switch(type) {
			case 'sequence':
				return {
					stroke: '#22c55e',  /* Zinc green */
					strokeWidth: 2,
					strokeDasharray: 'none'
				};
			case 'choice':
				return {
					stroke: '#f59e0b',   /* Zinc amber */
					strokeWidth: 2,
					strokeDasharray: '8,4'
				};
			case 'branch':
				return {
					stroke: '#06b6d4',  /* Zinc cyan */
					strokeWidth: 2,
					strokeDasharray: '4,4'
				};
			default:
				return baseStyle;
		}
	}

	/**
	 * Get connection type icon
	 */
	function getConnectionIcon(type) {
		const icons = {
			sequence: '→',
			choice: '⚡',
			branch: '🌿'
		};
		return icons[type] || icons.sequence;
	}

	/**
	 * Handle edge selection
	 */
	function handleSelect() {
		uiStore.selectItems(id);
	}

	/**
	 * Handle edge deletion
	 */
	function handleDelete(event) {
		event.stopPropagation();
		storyChunksStore.removeConnection(id);
	}

	/**
	 * Handle context menu
	 */
	function handleContextMenu(event) {
		event.preventDefault();
		event.stopPropagation();
		uiStore.showContextMenu({ x: event.clientX, y: event.clientY });
		uiStore.selectItems(id);
	}
</script>

<!-- Edge Path -->
<path
	{id}
	class="chunk-edge"
	class:selected={isSelected}
	class:animated={hasAnimation}
	d={edgePath}
	stroke={edgeStyle.stroke}
	stroke-width={edgeStyle.strokeWidth}
	stroke-dasharray={edgeStyle.strokeDasharray}
	fill="none"
	marker-end="url(#arrowhead-{connectionType})"
	style={typeof style === 'string' ? style : ''}
	onclick={handleSelect}
	oncontextmenu={handleContextMenu}
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); } }}
	role="button"
	tabindex="0"
/>

<!-- Animated Dots for Choice and Branch connections -->
{#if connectionType === 'choice'}
	<circle
		r="3"
		fill="#f59e0b"
		class="connection-dot choice-dot"
	>
		<animateMotion dur="2s" repeatCount="indefinite">
			<mpath href="#{id}" />
		</animateMotion>
	</circle>
{/if}

{#if connectionType === 'branch'}
	<circle
		r="2"
		fill="#10b981"
		class="connection-dot branch-dot"
	>
		<animateMotion dur="3s" repeatCount="indefinite">
			<mpath href="#{id}" />
		</animateMotion>
	</circle>
{/if}

<!-- Edge Label -->
{#if connectionLabel || isSelected}
	<div
		class="edge-label"
		class:selected={isSelected}
		class:choice-label={connectionType === 'choice'}
		class:branch-label={connectionType === 'branch'}
		style="transform: translate(-50%, -50%) translate({labelX}px, {labelY}px); position: absolute; pointer-events: all; z-index: 1000;"
		onclick={handleSelect}
		oncontextmenu={handleContextMenu}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); } }}
		role="button"
		tabindex="0"
	>
		<div class="label-content">
			<span class="connection-icon">{getConnectionIcon(connectionType)}</span>
			{#if connectionLabel}
				<span class="label-text">{connectionLabel}</span>
			{/if}
			{#if isSelected}
				<button
					class="delete-btn"
					onclick={handleDelete}
					title="Delete connection"
					aria-label="Delete connection"
				>
					×
				</button>
			{/if}
		</div>
	</div>
{/if}

<!-- Custom Arrowheads (defined in parent component or global) -->
<svelte:head>
	<!-- This should ideally be in app.html or a parent component -->
	<style>
		/* SVG Arrowhead Definitions */
	</style>
</svelte:head>

<style>
	.chunk-edge {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.chunk-edge:hover {
		stroke-width: 4;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.chunk-edge.selected {
		stroke-width: 4;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
	}

	.chunk-edge.animated {
		animation: connectionAppear 0.5s ease-out;
	}

	.connection-dot {
		filter: drop-shadow(0 0 4px currentColor);
	}

	.choice-dot {
		filter: drop-shadow(0 0 6px #f59e0b);
	}

	.branch-dot {
		filter: drop-shadow(0 0 4px #10b981);
	}

	/* Edge Labels */
	.edge-label {
		position: absolute;
		pointer-events: all;
		cursor: pointer;
		z-index: 1000;
	}

	.label-content {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #1c1917;
		border: 1px solid #292524;
		border-radius: 12px;
		padding: 4px 8px;
		font-size: 12px;
		font-weight: 500;
		color: #e4e4e7;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.edge-label:hover .label-content {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: scale(1.05);
	}

	.edge-label.selected .label-content {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.connection-icon {
		font-size: 14px;
		line-height: 1;
	}

	.label-text {
		max-width: 100px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.delete-btn {
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 50%;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-left: 4px;
	}

	.delete-btn:hover {
		background: #dc2626;
		transform: scale(1.1);
	}

	.choice-label .label-content {
		background: #f59e0b;
		border-color: #d97706;
		color: #000000;
	}

	.branch-label .label-content {
		background: #10b981;
		border-color: #059669;
		color: #000000;
	}

	/* Animations */
	@keyframes connectionAppear {
		from {
			opacity: 0;
			stroke-dasharray: 1000;
			stroke-dashoffset: 1000;
		}
		to {
			opacity: 1;
			stroke-dashoffset: 0;
		}
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	/* Different styles for connection types */
	.chunk-edge[stroke="#f59e0b"] {
		/* Choice connections have a pulsing effect */
		animation: connectionAppear 0.5s ease-out, pulse 2s infinite;
	}

	.chunk-edge[stroke="#10b981"] {
		/* Branch connections have a flowing effect */
		stroke-dasharray: 8, 4;
		animation: connectionAppear 0.5s ease-out, flow 3s linear infinite;
	}

	@keyframes flow {
		0% {
			stroke-dashoffset: 0;
		}
		100% {
			stroke-dashoffset: 12;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.label-content {
			font-size: 10px;
			padding: 2px 6px;
		}

		.connection-icon {
			font-size: 12px;
		}

		.connection-dot {
			r: 2;
		}

		.choice-dot {
			r: 2.5;
		}

		.branch-dot {
			r: 1.5;
		}
	}
</style>

<!-- Global SVG definitions for arrowheads -->
<svg style="position: absolute; width: 0; height: 0;">
	<defs>
		<!-- Default arrowhead -->
		<marker
			id="arrowhead-default"
			markerWidth="10"
			markerHeight="10"
			refX="8"
			refY="3"
			orient="auto"
			markerUnits="strokeWidth"
		>
			<path
				d="M0,0 L0,6 L9,3 z"
				fill="#6b7280"
				stroke="#6b7280"
			/>
		</marker>

		<!-- Sequence arrowhead -->
		<marker
			id="arrowhead-sequence"
			markerWidth="10"
			markerHeight="10"
			refX="8"
			refY="3"
			orient="auto"
			markerUnits="strokeWidth"
		>
			<path
				d="M0,0 L0,6 L9,3 z"
				fill="#3b82f6"
				stroke="#3b82f6"
			/>
		</marker>

		<!-- Choice arrowhead -->
		<marker
			id="arrowhead-choice"
			markerWidth="12"
			markerHeight="12"
			refX="10"
			refY="3"
			orient="auto"
			markerUnits="strokeWidth"
		>
			<path
				d="M0,0 L0,6 L9,3 z"
				fill="#f59e0b"
				stroke="#f59e0b"
			/>
			<circle
				cx="3"
				cy="3"
				r="1"
				fill="#ffffff"
			/>
		</marker>

		<!-- Branch arrowhead -->
		<marker
			id="arrowhead-branch"
			markerWidth="12"
			markerHeight="12"
			refX="10"
			refY="3"
			orient="auto"
			markerUnits="strokeWidth"
		>
			<path
				d="M0,0 L0,6 L9,3 z"
				fill="#10b981"
				stroke="#10b981"
			/>
			<path
				d="M2,1 L7,3 L2,5"
				fill="none"
				stroke="#ffffff"
				stroke-width="0.5"
			/>
		</marker>
	</defs>
</svg>