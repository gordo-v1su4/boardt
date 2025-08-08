<script lang="ts">
	import { onMount } from 'svelte';
	import { uiStore } from '../lib/stores/ui.svelte.js';
	import { storyChunksStore } from '../lib/stores/storyChunks.svelte.js';
	import { presentationModeStore } from '../lib/stores/presentationMode.svelte.js';

	// Components
	import CanvasView from '../lib/components/Canvas/CanvasView.svelte';
	import ChunkCreator from '../lib/components/Canvas/ChunkCreator.svelte';
	import KeyframeInserter from '../lib/components/Canvas/KeyframeInserter.svelte';
	import PresentationView from '../lib/components/SetView/PresentationView.svelte';
	import ConnectionValidator from '../lib/components/StoryFlow/ConnectionValidator.svelte';

	// Reactive state
	$: currentView = uiStore.currentView;
	$: isPresenting = presentationModeStore.isPresenting;

	// Tab navigation
	const tabs = [
		{ id: 'canvas', label: 'Canvas', icon: '🎨' },
		{ id: 'presentation', label: 'Presentation', icon: '📽️' }
	];

	/**
	 * Switch between views
	 */
	function switchView(viewId: string) {
		uiStore.switchView(viewId);
	}

	/**
	 * Handle keyboard shortcuts
	 */
	function handleKeydown(event: KeyboardEvent) {
		// Global shortcuts
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case '1':
					event.preventDefault();
					switchView('canvas');
					break;
				case '2':
					event.preventDefault();
					switchView('presentation');
					break;
			}
		}
	}

	/**
	 * Initialize application
	 */
	onMount(() => {
		// Load any saved data from localStorage
		try {
			const savedData = localStorage.getItem('storyboard-generator-data');
			if (savedData) {
				const data = JSON.parse(savedData);
				storyChunksStore.loadFromData(data);
			}
		} catch (error) {
			console.warn('Failed to load saved data:', error);
		}

		// Auto-save data periodically
		const saveInterval = setInterval(() => {
			try {
				const data = storyChunksStore.exportData();
				localStorage.setItem('storyboard-generator-data', JSON.stringify(data));
			} catch (error) {
				console.warn('Failed to save data:', error);
			}
		}, 30000); // Save every 30 seconds

		// Cleanup on unmount
		return () => {
			clearInterval(saveInterval);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>Storyboard Generator</title>
	<meta name="description" content="AI-powered storyboard generator for video content creators" />
</svelte:head>

<div class="app" class:presenting={isPresenting}>
	{#if !isPresenting}
		<!-- Tab Navigation -->
		<nav class="tab-navigation">
			<div class="nav-content">
				<div class="app-title">
					<h1>📽️ Storyboard Generator</h1>
				</div>

				<div class="tab-buttons">
					{#each tabs as tab}
						<button
							class="tab-btn"
							class:active={currentView === tab.id}
							onclick={() => switchView(tab.id)}
							title="{tab.label} (Ctrl+{tabs.indexOf(tab) + 1})"
						>
							<span class="tab-icon">{tab.icon}</span>
							<span class="tab-label">{tab.label}</span>
						</button>
					{/each}
				</div>

				<div class="nav-actions">
					<button
						class="action-btn"
						onclick={() => uiStore.openSettingsDialog()}
						title="Settings"
					>
						⚙️
					</button>
				</div>
			</div>
		</nav>
	{/if}

	<!-- Main Content -->
	<main class="main-content">
		{#if currentView === 'canvas'}
			<CanvasView />
		{:else if currentView === 'presentation'}
			<PresentationView />
		{/if}
	</main>

	<!-- Modals and Overlays -->
	<ChunkCreator />
	<KeyframeInserter />
	<ConnectionValidator />
</div>

<style>
	.app {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #18181b; /* zinc-900 */
		color: #fafafa; /* zinc-50 */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		overflow: hidden;
	}

	.app.presenting {
		background: #000;
	}

	.tab-navigation {
		background: #27272a; /* zinc-800 */
		border-bottom: 1px solid #3f3f46; /* zinc-700 */
		padding: 0 24px;
		flex-shrink: 0;
	}

	.nav-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.app-title h1 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #fafafa; /* zinc-50 */
	}

	.tab-buttons {
		display: flex;
		gap: 4px;
		background: #3f3f46; /* zinc-700 */
		border-radius: 8px;
		padding: 4px;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		color: #a1a1aa; /* zinc-400 */
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tab-btn:hover {
		background: #52525b; /* zinc-600 */
		color: #e4e4e7; /* zinc-200 */
	}

	.tab-btn.active {
		background: #18181b; /* zinc-900 */
		color: #fafafa; /* zinc-50 */
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.tab-icon {
		font-size: 16px;
	}

	.tab-label {
		font-weight: 500;
	}

	.nav-actions {
		display: flex;
		gap: 8px;
	}

	.action-btn {
		background: #3f3f46; /* zinc-700 */
		border: 1px solid #52525b; /* zinc-600 */
		border-radius: 6px;
		padding: 8px;
		font-size: 16px;
		color: #e4e4e7; /* zinc-200 */
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-btn:hover {
		background: #52525b; /* zinc-600 */
	}

	.main-content {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.nav-content {
			padding: 0 16px;
		}

		.app-title h1 {
			font-size: 1.1rem;
		}

		.tab-btn {
			padding: 6px 12px;
			font-size: 13px;
		}

		.tab-label {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.tab-navigation {
			padding: 0 12px;
		}

		.nav-content {
			height: 56px;
		}

		.app-title h1 {
			font-size: 1rem;
		}

		.tab-btn {
			padding: 6px 8px;
		}
	}

	/* Global styles */
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(button) {
		font-family: inherit;
	}

	:global(input, textarea, select) {
		font-family: inherit;
	}
</style>