<script lang="ts">
	import { titleScreen, screenSize } from '../store';

	export let timeToLoop: number;
	export let distance: number;

	$: margin = (distance / 100) * $screenSize;
</script>

<div
	id="objective-wrapper"
	class:lost={$titleScreen}
	class:spin={!$titleScreen}
	class="absolute transition-opacity duration-1000"
	style:--margin="{margin}px"
	style:--time="{timeToLoop}ms"
>
	<div id="objective" class="pulse" />
</div>

<style>
	#objective {
		margin-right: var(--margin);
	}
	.lost {
		opacity: 0;
	}
	.spin {
		animation: spin var(--time) linear infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(90deg);
		}
		to {
			transform: rotate(450deg);
		}
	}

	.pulse,
	.pulse::after {
		animation: 1s ease-out 1s normal none infinite running pulse;
		border: 5px solid rgb(245, 158, 11);
		border-radius: 50%;
		display: inline-block;
		padding: 0.5rem;
		transform: scale3d(0.7, 0.7, 0);
		transition: opacity 0.75s ease 0s;
	}
	.pulse::after {
		content: '';
		display: block;
	}
	@keyframes pulse {
		50% {
			border-color: rgba(245, 158, 11, 0.3);
		}
		100% {
			border-color: transparent;
			transform: none;
		}
	}
</style>
