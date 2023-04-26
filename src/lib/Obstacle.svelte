<script lang="ts">
	import { screenSize, win } from '../store';

	export let radius = 0;
	export let collided = false;
	export let duration = 5000;

	$: borderWidth = ($screenSize * 20) / 1080;
</script>

<div class="absolute overflow-hidden">
	<div
		style:--size="{$screenSize}px"
		style:--radius="{radius}deg"
		style:--duration="{duration}ms"
		style:border-width="{borderWidth}px"
		class:collided
		class:win={$win}
		class="overflow-hidden border-t-4 border-solid rounded-full obstacle border-violet-400 border-t-transparent"
	/>
</div>

<style>
	.obstacle {
		transform: scale(1) rotate(var(--radius));
		width: var(--size);
		height: var(--size);
		scale: 1;
		animation: scale var(--duration) linear;
	}

	.collided {
		@apply opacity-30 border-b-red-500 border-l-red-500 border-r-red-500;
	}

	.win {
		@apply opacity-0 border-b-green-500 border-l-green-500 border-r-green-500;
	}

	@keyframes scale {
		0% {
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		99% {
			opacity: 1;
		}
		100% {
			transform: scale(0) rotate(var(--radius));
			opacity: 0;
		}
	}
</style>
