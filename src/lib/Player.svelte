<script lang="ts">
	import { minWidth } from '../store';

	export let x = 0;
	export let y = 0;

	$: size = Math.max(($minWidth * 8) / 1080, 2);
</script>

<div
	id="player-radio"
	class="absolute transition-transform duration-75"
	style:--x="{x}deg"
	style:--y="{y}px"
>
	<div style:width="{size}px" style:height="{size}px" id="player" class="bg-white" />
</div>

<style>
	#player-radio {
		transform: rotate(var(--x));
	}
	#player {
		margin-right: var(--y);
		transform: rotate(45deg);
	}
</style>
