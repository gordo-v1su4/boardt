<!-- ChunkCreator.svelte - src/lib/components/Canvas/ChunkCreator.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	// Event dispatcher for component communication
	const dispatch = createEventDispatcher();

	// Props using Svelte 5 $props()
	let { onClose = () => {}, onCreate = () => {} } = $props();

	// Form state using Svelte 5 Runes
	let selectedType = $state('sequence');
	let chunkTitle = $state('');
	let chunkDescription = $state('');
	let generateImage = $state(false);
	let imagePrompt = $state('');
	let tags = $state('');
	let duration = $state('5');
	let characters = $state('');

	// Validation state
	let errors = $state({
		title: '',
		description: '',
		imagePrompt: '',
		duration: ''
	});
	let isSubmitting = $state(false);

	// Modal reference for focus management
	let modalRef: HTMLDivElement;
	let titleInput: HTMLInputElement;

	// Chunk type definitions
	const chunkTypes = [
		{
			id: 'sequence',
			name: 'Sequence',
			icon: '📺',
			description: 'A linear story progression that flows naturally to the next scene.',
			color: '#3b82f6',
			examples: ['Opening scene', 'Character introduction', 'Plot development']
		},
		{
			id: 'choice', 
			name: 'Choice',
			icon: '🔀',
			description: 'A decision point where the story can branch into multiple paths.',
			color: '#f59e0b',
			examples: ['Moral dilemma', 'Multiple solutions', 'Character decisions']
		},
		{
			id: 'keyframe',
			name: 'Keyframe',
			icon: '🎯', 
			description: 'A critical moment or key visual that anchors the story.',
			color: '#10b981',
			examples: ['Climactic moment', 'Visual reveal', 'Emotional peak']
		}
	];

	// Computed properties
	let selectedTypeInfo = $derived(chunkTypes.find(type => type.id === selectedType));
	let isValid = $derived(chunkTitle.trim().length > 0 && Object.values(errors).every(error => error === ''));
	let tagList = $derived(tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0));

	// Validation
	function validateForm() {
		const newErrors = {
			title: '',
			description: '',
			imagePrompt: '',
			duration: ''
		};

		if (!chunkTitle.trim()) {
			newErrors.title = 'Title is required';
		} else if (chunkTitle.trim().length < 3) {
			newErrors.title = 'Title must be at least 3 characters';
		} else if (chunkTitle.trim().length > 100) {
			newErrors.title = 'Title must be less than 100 characters';
		}

		if (chunkDescription.length > 500) {
			newErrors.description = 'Description must be less than 500 characters';
		}

		if (generateImage && imagePrompt.trim().length === 0) {
			newErrors.imagePrompt = 'Image prompt is required when generating images';
		}

		if (duration && (isNaN(Number(duration)) || Number(duration) < 1 || Number(duration) > 60)) {
			newErrors.duration = 'Duration must be between 1 and 60 seconds';
		}

		errors = newErrors;
		return Object.values(newErrors).every(error => error === '');
	}

	// Event handlers
	function handleTypeSelect(type: any) {
		selectedType = type.id;
		
		// Auto-populate example content for better UX
		if (!chunkTitle.trim() && type.examples && type.examples.length > 0) {
			chunkTitle = type.examples[0];
		}
	}

	function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		isSubmitting = true;

		const chunkData = {
			type: selectedType,
			title: chunkTitle.trim(),
			description: chunkDescription.trim(),
			hasImage: generateImage,
			imagePrompt: generateImage ? imagePrompt.trim() : '',
			tags: tagList,
			metadata: {
				duration: duration ? `${duration}s` : '5s',
				characters: characters.trim() || undefined,
				createdAt: new Date().toISOString()
			}
		};

		// Simulate async operation
		setTimeout(() => {
			onCreate(chunkData);
			dispatch('create', chunkData);
			isSubmitting = false;
			handleClose();
		}, 500);
	}

	function handleClose() {
		onClose();
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		// Close modal on Escape
		if (event.key === 'Escape') {
			handleClose();
		}
		// Submit on Ctrl/Cmd + Enter
		if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
			handleSubmit();
		}
	}

	function handleBackdropClick(event: any) {
		if (event.target === modalRef) {
			handleClose();
		}
	}

	// Reactive validation
	$effect(() => {
		if (chunkTitle || chunkDescription || imagePrompt || duration) {
			validateForm();
		}
	});

	// Focus management
	onMount(() => {
		titleInput?.focus();
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- Modal Backdrop -->
<div
	class="modal-backdrop"
	bind:this={modalRef}
	onclick={handleBackdropClick}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	tabindex="-1"
>
	<div class="modal-container">
		<!-- Modal Header -->
		<div class="modal-header">
			<h2 id="modal-title" class="modal-title">
				Create New Story Chunk
			</h2>
						<button
				class="close-button"
				onclick={handleClose}
				aria-label="Close modal"
			>
				✕
			</button>
		</div>

		<!-- Modal Content -->
		<div class="modal-content">
			<!-- Chunk Type Selection -->
			<div class="section">
				<label class="section-label" id="chunk-type-label">Chunk Type</label>
				<div class="type-grid" role="radiogroup" aria-labelledby="chunk-type-label">
					{#each chunkTypes as type}
						<button
							class="type-card"
							class:selected={selectedType === type.id}
							style:--type-color={type.color}
							onclick={() => handleTypeSelect(type)}
							role="radio"
							aria-checked={selectedType === type.id}
							aria-label={type.name}
						>
							<div class="type-icon">{type.icon}</div>
							<div class="type-name">{type.name}</div>
							<div class="type-description">{type.description}</div>

							{#if selectedType === type.id}
								<div class="type-examples">
									<strong>Examples:</strong>
									{#each type.examples as example}
										<span class="example-tag">{example}</span>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Chunk Details -->
			<div class="section">
				<label class="section-label" for="chunk-title">
					Chunk Title <span class="required">*</span>
				</label>
				<input
					id="chunk-title"
					bind:this={titleInput}
					bind:value={chunkTitle}
					type="text"
					placeholder="Enter a descriptive title for this chunk..."
					class="text-input"
					class:error={errors.title}
					maxlength="100"
				/>
				{#if errors.title}
					<div class="error-message">{errors.title}</div>
				{/if}
			</div>

			<div class="section">
				<label class="section-label" for="chunk-description">
					Description
				</label>
				<textarea
					id="chunk-description"
					bind:value={chunkDescription}
					placeholder="Describe what happens in this chunk..."
					class="textarea-input"
					class:error={errors.description}
					rows="3"
					maxlength="500"
				></textarea>
				{#if errors.description}
					<div class="error-message">{errors.description}</div>
				{/if}
				<div class="character-count">
					{chunkDescription.length}/500
				</div>
			</div>

			<!-- AI Image Generation -->
			<div class="section">
				<div class="checkbox-section">
					<input
						id="generate-image"
						bind:checked={generateImage}
						type="checkbox"
						class="checkbox-input"
					/>
					<label for="generate-image" class="checkbox-label">
						🎨 Generate AI Image
					</label>
				</div>

				{#if generateImage}
					<div class="subsection">
						<label class="section-label" for="image-prompt">
							Image Prompt <span class="required">*</span>
						</label>
						<textarea
							id="image-prompt"
							bind:value={imagePrompt}
							placeholder="Describe the image you want to generate..."
							class="textarea-input"
							class:error={errors.imagePrompt}
							rows="2"
						></textarea>
						{#if errors.imagePrompt}
							<div class="error-message">{errors.imagePrompt}</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Metadata -->
			<div class="metadata-section">
				<div class="metadata-grid">
					<div class="metadata-field">
						<label class="section-label" for="duration">Duration (seconds)</label>
						<input
							id="duration"
							bind:value={duration}
							type="number"
							min="1"
							max="60"
							class="number-input"
							class:error={errors.duration}
						/>
						{#if errors.duration}
							<div class="error-message">{errors.duration}</div>
						{/if}
					</div>

					<div class="metadata-field">
						<label class="section-label" for="characters">Characters</label>
						<input
							id="characters"
							bind:value={characters}
							type="text"
							placeholder="Main characters in scene"
							class="text-input"
						/>
					</div>
				</div>
			</div>

			<div class="section">
				<label class="section-label" for="tags">Tags (comma-separated)</label>
				<input
					id="tags"
					bind:value={tags}
					type="text"
					placeholder="action, outdoor, night, dramatic..."
					class="text-input"
				/>
				{#if tagList.length > 0}
					<div class="tag-preview">
						{#each tagList as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Modal Footer -->
		<div class="modal-footer">
			<div class="footer-info">
				<span class="keyboard-hint">
					Press <kbd>Esc</kbd> to cancel, <kbd>Ctrl+Enter</kbd> to create
				</span>
			</div>
			
			<div class="footer-actions">
				<button
					class="btn btn-secondary"
					onclick={handleClose}
					disabled={isSubmitting}
				>
					Cancel
				</button>
				<button
					class="btn btn-primary"
					class:loading={isSubmitting}
					onclick={handleSubmit}
					disabled={!isValid || isSubmitting}
				>
					{#if isSubmitting}
						<span class="loading-spinner"></span>
						Creating...
					{:else}
						Create Chunk
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* Modal Backdrop */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(9, 9, 11, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
		backdrop-filter: blur(4px);
	}

	.modal-container {
		background: #1c1917;
		border-radius: 16px;
		border: 1px solid #292524;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Modal Header */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px;
		border-bottom: 1px solid #292524;
		background: #09090b;
	}

	.modal-title {
		color: #fafaf9;
		font-size: 18px;
		font-weight: 600;
		margin: 0;
	}

	.close-button {
		background: none;
		border: none;
		color: #a1a1aa;
		font-size: 20px;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.close-button:hover {
		background: #292524;
		color: #fafaf9;
	}

	/* Modal Content */
	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
		color: #fafaf9;
	}

	.section {
		margin-bottom: 24px;
	}

	.subsection {
		margin-top: 16px;
		padding-left: 16px;
		border-left: 2px solid #292524;
	}

	.section-label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: #e4e4e7;
		margin-bottom: 8px;
	}

	.required {
		color: #ef4444;
	}

	/* Type Selection */
	.type-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.type-card {
		background: #292524;
		border: 2px solid #3f3f46;
		border-radius: 12px;
		padding: 16px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.type-card:hover {
		background: #3f3f46;
		border-color: #52525b;
	}

	.type-card.selected {
		border-color: var(--type-color);
		background: rgba(34, 197, 94, 0.1);
		box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
	}

	.type-icon {
		font-size: 24px;
		margin-bottom: 8px;
	}

	.type-name {
		font-weight: 600;
		font-size: 16px;
		color: #fafaf9;
		margin-bottom: 4px;
	}

	.type-description {
		font-size: 12px;
		color: #a1a1aa;
		line-height: 1.4;
	}

	.type-examples {
		margin-top: 12px;
		padding-top: 8px;
		border-top: 1px solid #3f3f46;
		font-size: 11px;
	}

	.example-tag {
		display: inline-block;
		background: var(--type-color);
		color: #ffffff;
		padding: 2px 6px;
		border-radius: 4px;
		margin: 2px 2px 2px 0;
		font-size: 10px;
	}

	/* Form Inputs */
	.text-input,
	.textarea-input,
	.number-input {
		width: 100%;
		padding: 12px;
		background: #292524;
		border: 1px solid #3f3f46;
		border-radius: 8px;
		color: #fafaf9;
		font-size: 14px;
		transition: all 0.2s;
	}

	.text-input:focus,
	.textarea-input:focus,
	.number-input:focus {
		outline: none;
		border-color: #22c55e;
		box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
	}

	.text-input.error,
	.textarea-input.error,
	.number-input.error {
		border-color: #ef4444;
	}

	.textarea-input {
		resize: vertical;
		min-height: 80px;
	}

	.character-count {
		text-align: right;
		font-size: 11px;
		color: #71717a;
		margin-top: 4px;
	}

	.error-message {
		color: #ef4444;
		font-size: 12px;
		margin-top: 4px;
	}

	/* Checkbox */
	.checkbox-section {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

			.checkbox-input {
		width: 18px;
		height: 18px;
		accent-color: #22c55e;
		background: #292524;
		border: 1px solid #3f3f46;
	}

	.checkbox-label {
		font-size: 14px;
		color: #e4e4e7;
		cursor: pointer;
	}

	/* Metadata */
	.metadata-section {
		border-top: 1px solid #292524;
		padding-top: 16px;
	}

	.metadata-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.metadata-field {
		display: flex;
		flex-direction: column;
	}

	/* Tags */
	.tag-preview {
		margin-top: 8px;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.tag {
		background: #4b5563;
		color: #d1d5db;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 500;
	}

	/* Modal Footer */
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-top: 1px solid #374151;
		background: #111827;
	}

	.footer-info {
		font-size: 12px;
		color: #6b7280;
	}

	.keyboard-hint kbd {
		background: #374151;
		border: 1px solid #4b5563;
		border-radius: 3px;
		padding: 1px 4px;
		font-size: 10px;
		font-family: monospace;
	}

	.footer-actions {
		display: flex;
		gap: 12px;
	}

	/* Buttons */
	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: #4b5563;
		color: #d1d5db;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #6b7280;
	}

	.btn-primary {
		background: #3b82f6;
		color: #ffffff;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary.loading {
		cursor: not-allowed;
	}

	.loading-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid #ffffff;
		border-top: 2px solid transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.modal-container {
			margin: 10px;
			max-height: calc(100vh - 20px);
		}

		.type-grid {
			grid-template-columns: 1fr;
		}

		.metadata-grid {
			grid-template-columns: 1fr;
		}

		.modal-footer {
			flex-direction: column;
			gap: 12px;
			align-items: stretch;
		}

		.footer-actions {
			justify-content: stretch;
		}

		.footer-actions .btn {
			flex: 1;
		}
	}
</style>