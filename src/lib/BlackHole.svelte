<script lang="ts">
	export let size = 0;
	$: blur = 200 / size;
</script>

<div
	style:--blur="{blur}px"
	style:--size="{size}px"
	id="hole"
	class="absolute bg-black border-4 border-t-8 border-solid rounded-full border-violet-800"
/>

<style>
	#hole {
		width: var(--size);
		height: var(--size);
		/* border-t-violet-400 animate-spin */
		/* animation-duration: 12s; */
		/* animation-duration: 1s; */
		filter: blur(var(--blur)) drop-shadow(1px -2px 12px #a21caf);
		animation: blackhole-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes blackhole-pulse {
		50% {
			scale: 1.05;
		}
	}
</style>
