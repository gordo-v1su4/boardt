<!-- ChunkEdge.svelte - src/lib/components/Canvas/ChunkEdge.svelte -->
<script lang="ts">
	import { getBezierPath } from '@xyflow/svelte';

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
	let edgeStyle = $derived(getEdgeStyle(data?.type));
	let hasAnimation = $derived(data?.type === 'choice' || data?.type === 'branch');

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

	function getConnectionLabel(type) {
		switch(type) {
			case 'sequence': return '';
			case 'choice': return '?';
			case 'branch': return '→';
			default: return '';
		}
	}

	function handleEdgeClick(event) {
		event.stopPropagation();
		console.log('Edge clicked:', id);
	}

	function handleEdgeDoubleClick(event) {
		event.stopPropagation();
		console.log('Edit connection:', id);
	}
</script>

<!-- Edge Path -->
<path
	{id}
	class="chunk-edge"
	class:selected
	class:animated={hasAnimation}
	d={edgePath}
	stroke={edgeStyle.stroke}
	stroke-width={edgeStyle.strokeWidth}
	stroke-dasharray={edgeStyle.strokeDasharray}
	fill="none"
	marker-end="url(#arrowhead-{data?.type || 'default'})"
			style={typeof style === 'string' ? style : ''}
	onclick={handleEdgeClick}
	ondblclick={handleEdgeDoubleClick}
/>

<!-- Animated Dots for Choice and Branch connections -->
{#if data?.type === 'choice'}
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

{#if data?.type === 'branch'}
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

	<!-- Edge Label (for complex connections) -->
	{#if data?.label || getConnectionLabel(data?.type)}
		<div
			class="edge-label"
			class:choice-label={data?.type === 'choice'}
			class:branch-label={data?.type === 'branch'}
			style="transform: translate(-50%, -50%) translate({labelX}px, {labelY}px); position: absolute; pointer-events: all; z-index: 1000;"
		>
			{data?.label || getConnectionLabel(data?.type)}
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
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.chunk-edge:hover {
		stroke-width: 3;
		filter: drop-shadow(0 0 6px currentColor);
	}

	.chunk-edge.selected {
		stroke-width: 4;
		filter: drop-shadow(0 0 8px currentColor);
		animation: pulse 2s infinite;
	}

	.chunk-edge.animated.choice-dot {
		stroke-dasharray: 8,4;
		animation: dash-choice 1.5s linear infinite;
	}

	.chunk-edge.animated.branch-dot {
		stroke-dasharray: 4,4;
		animation: dash-branch 2s linear infinite;
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
		background: #1c1917;
		border: 1px solid #292524;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: bold;
		color: #fafaf9;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		cursor: pointer;
		transition: all 0.2s;
	}

	.edge-label:hover {
		transform: translate(-50%, -50%) scale(1.1) !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	.choice-label {
		background: #f59e0b;
		border-color: #d97706;
		color: #000000;
	}

	.branch-label {
		background: #10b981;
		border-color: #059669;
		color: #000000;
	}

	/* Animations */
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	@keyframes dash-choice {
		0% {
			stroke-dashoffset: 0;
		}
		100% {
			stroke-dashoffset: 12;
		}
	}

	@keyframes dash-branch {
		0% {
			stroke-dashoffset: 0;
		}
		100% {
			stroke-dashoffset: 8;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.edge-label {
			width: 20px;
			height: 20px;
			font-size: 10px;
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