<script lang="ts">
	import { fade } from 'svelte/transition';
	import { lost, minWidth } from '../store';

	export let size = 0;
	$: blur = 200 / size;

	let showTitle = false;
	let showTitleTimeout: number;

	$: fontSize = $minWidth / 20;

	$: if ($lost) {
		showTitleTimeout = setTimeout(() => (showTitle = true), 1000);
	} else {
		showTitle = false;
		clearTimeout(showTitleTimeout);
	}
</script>

<div class="flex items-center justify-center blackhole-pulse">
	<div
		style:--blur="{blur}px"
		style:--size="{size}px"
		id="hole"
		class="absolute bg-black border-4 border-t-8 border-solid rounded-full border-violet-800"
	/>
	{#if showTitle}
		<span
			style:font-size="{fontSize}px"
			class="z-10 text-white transition-all duration-500"
			in:fade={{ duration: 1000 }}
			out:fade={{ duration: 200 }}
		>
			Survive the hole
		</span>
	{/if}
</div>

<style>
	#hole {
		width: var(--size);
		height: var(--size);
		filter: blur(var(--blur)) drop-shadow(1px -2px 12px #a21caf);
	}
	.blackhole-pulse {
		animation: blackhole-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes blackhole-pulse {
		50% {
			scale: 1.05;
		}
	}
</style>
