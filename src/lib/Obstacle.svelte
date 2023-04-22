<script lang="ts">
	import { minWidth } from '../store';
	export let r = 0;
	export let collided = false;
	$: borderWidth = ($minWidth * 20) / 1080;
</script>

<div class="absolute overflow-hidden">
	<div
		style:--size="{$minWidth}px"
		style:--r="{r}deg"
		style:border-width="{borderWidth}px"
		class:collided
		class="border-t-4 border-solid rounded-full obstacle border-violet-400 border-t-transparent"
	/>
</div>

<style>
	.obstacle {
		transform: scale(1) rotate(var(--r));
		width: var(--size);
		height: var(--size);
		scale: 1;
		overflow: hidden;
		animation: scale 5s linear infinite;
	}

	.collided {
		@apply opacity-30 border-b-red-500 border-l-red-500 border-r-red-500;
	}

	@keyframes scale {
		0% {
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		to {
			transform: scale(0) rotate(var(--r));
		}
	}
</style>
