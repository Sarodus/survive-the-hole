<script lang="ts">
	import { titleScreen, screenSize } from '../store';

	export let timeToLoop: number;
	export let distance: number;

	$: margin = (distance / 100) * $screenSize;
	$: size = ($screenSize * 50) / 1080;
	$: borderWidth = ($screenSize * 5) / 1080;
</script>

<div
	id="objective-wrapper"
	class:lost={$titleScreen}
	class:spin={!$titleScreen}
	class="absolute"
	style:--margin="{margin}px"
	style:--time="{timeToLoop}ms"
	style:--size="{size}px"
>
	<div id="objective" class="relative flex items-center justify-center">
		<div class="absolute w-1 h-1 rounded-full bg-amber-500 border-amber-500" />
		<div
			style:border-width="{borderWidth}px"
			class="absolute w-full h-full rounded-full border-amber-500 pulse"
		/>
		<div
			style:border-width="{borderWidth}px"
			class="absolute w-1/2 rounded-full h-1/2 border-amber-500 pulse"
		/>
	</div>
</div>

<style>
	#objective {
		margin-right: var(--margin);
		width: var(--size);
		height: var(--size);
	}
	.lost {
		opacity: 0;
	}
	.spin {
		animation: spin var(--time) linear infinite;
	}
	.pulse {
		animation: 1s ease-out 1s normal none infinite running pulse;
		transform: scale3d(0.7, 0.7, 0);
		transition: opacity 0.75s ease 0s;
	}

	@keyframes spin {
		from {
			transform: rotate(90deg);
		}
		to {
			transform: rotate(450deg);
		}
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
