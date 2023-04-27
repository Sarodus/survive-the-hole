<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { titleScreen, screenSize } from '../store';

	const holeSize = tweened(20, { duration: 400 });

	export let size = 20;
	export let ticks = 0;

	$: size = $holeSize;

	let showTitle = false;
	let showTitleTimeout: number;

	$: blur = 200 / $holeSize;
	$: BLACK_HOLE_GROWTH = $screenSize / 5000;
	$: maxHoleSize = $screenSize / 2;

	$: if ($titleScreen) {
		$holeSize = maxHoleSize;
		showTitleTimeout = setTimeout(() => (showTitle = true), 1000);
	} else {
		$holeSize = Math.min(
			maxHoleSize,
			($screenSize * Math.min(Math.max(ticks * BLACK_HOLE_GROWTH, 20), 400)) / 1080
		);
		showTitle = false;
		clearTimeout(showTitleTimeout);
	}
</script>

<div class="flex items-center justify-center blackhole-pulse">
	<div
		style:--blur="{blur}px"
		style:--size="{$holeSize}px"
		id="hole"
		class="absolute bg-black border-4 border-t-8 border-solid rounded-full border-violet-800"
	/>
</div>

<style>
	#hole {
		width: var(--size);
		height: var(--size);
		filter: blur(var(--blur)) drop-shadow(1px -2px 12px #a21caf);
		animation: hole-pulse var(--bpm) cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	.blackhole-pulse {
		animation: blackhole-pulse var(--bpm) cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes blackhole-pulse {
		0% {
			scale: 1;
		}
		50% {
			scale: 1.05;
		}
	}
	@keyframes hole-pulse {
		0% {
			filter: blur(var(--blur)) drop-shadow(1px -2px 20px #a21caf);
		}
	}
</style>
