<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { titleScreen, screenSize } from '../store';

	export let x = 0;
	export let playerDistance = 0;

	const size = tweened(4, { duration: 2000 });

	$: margin = (playerDistance / 100) * $screenSize;
	$: $size = $titleScreen ? 0 : Math.max(($screenSize * 8) / 1080, 4);
</script>

<div
	id="player-radio"
	class="absolute transition-transform duration-75"
	style:--x="{x + 90}deg"
	style:--margin="{margin}px"
>
	<div style:width="{$size}px" style:height="{$size}px" id="player" class="rotate-45 bg-white" />
</div>

<style>
	#player-radio {
		transform: rotate(var(--x));
	}
	#player {
		margin-right: var(--margin);
	}
</style>
