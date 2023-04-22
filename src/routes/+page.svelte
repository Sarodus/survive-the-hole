<script lang="ts">
	import { onMount } from 'svelte';
	import BlackHole from '$lib/BlackHole.svelte';
	import Player from '$lib/Player.svelte';
	import Obstacle from '$lib/Obstacle.svelte';

	const BLACK_HOLE_GROWTH = 0.1;
	const PLAYER_SPEED = 0.1;
	const PLAYER_ROTATION_RATIO = 20;
	const DEBUG = true;

	type Obstacle = {
		id: number;
		x: number;
		r: number;
	};

	let left = false;
	let right = false;
	let x = 0;
	let y = 100;
	let ticks = 0;
	let obstacles: Obstacle[] = [{ id: 0, x: 500, r: 0 }];

	$: speed = y / PLAYER_ROTATION_RATIO;
	$: size = Math.max(ticks * BLACK_HOLE_GROWTH, 20);

	onMount(() => {
		const interval = setInterval(tick, 33);
		return () => clearInterval(interval);
	});

	function handleKeyPress(e: KeyboardEvent) {
		switch (e.code) {
			case 'KeyA':
			case 'ArrowLeft':
				left = true;
				break;

			case 'KeyD':
			case 'ArrowRight':
				right = true;
				break;
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		switch (e.code) {
			case 'KeyA':
			case 'ArrowLeft':
				left = false;
				break;

			case 'KeyD':
			case 'ArrowRight':
				right = false;
				break;
		}
	}

	function tick() {
		if (left) x -= speed;
		if (right) x += speed;
		ticks++;
		y += PLAYER_SPEED;
	}
</script>

<svelte:window
	on:keypress|preventDefault={handleKeyPress}
	on:keydown|preventDefault={handleKeyPress}
	on:keyup|preventDefault={handleKeyUp}
/>

<div class="w-screen h-screen flex items-center justify-center">
	{#if DEBUG}
		<div class="text-white absolute top-0 left-0">
			<p>left:{left}</p>
			<p>right:{right}</p>
			<p>x:{x}</p>
			<p>y:{y}</p>
			<p>speed:{speed}</p>
			<p>size:{size}</p>
		</div>
	{/if}
	{#each obstacles as obstacle (obstacle.id)}
		<Obstacle x={obstacle.x} r={obstacle.r} />
	{/each}
	<BlackHole {size} />
	<Player bind:x bind:y />
</div>
