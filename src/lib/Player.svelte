<script lang="ts">
	export let x = 0;
	export let y = 0;
</script>

<div
	id="player-radio"
	class="absolute transition-transform duration-75"
	style:--x="{x}deg"
	style:--y="{y}px"
>
	<div id="player" class="w-2 h-2 bg-white" />
</div>

<style>
	#player-radio {
		transform: rotate(var(--x));
	}
	#player {
		margin-right: var(--y);
	}
</style>
