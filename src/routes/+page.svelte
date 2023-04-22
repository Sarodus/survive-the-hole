<script lang="ts">
	import { onMount } from 'svelte';
	import BlackHole from '$lib/BlackHole.svelte';
	import Player from '$lib/Player.svelte';
	import Obstacle from '$lib/Obstacle.svelte';
	import { minWidth } from '../store';

	const BLACK_HOLE_GROWTH = 0.1;
	const PLAYER_SPEED = 0.1;
	const PLAYER_ROTATION_RATIO = 20;
	const DEBUG = true;

	type Obstacle = {
		id: number;
		r: number;
		offset: number;
	};

	let left = false;
	let right = false;
	let x = 0;
	let y = 100;
	let ticks = 0;
	let width = 1920;
	let height = 1080;

	let obstacleChangeIndex = 0;

	let obstacles: Obstacle[] = [
		{ id: 0, r: 0, offset: 0 },
		{ id: 1, r: 90, offset: 1000 },
		{ id: 2, r: 180, offset: 2000 },
		{ id: 3, r: 270, offset: 3000 },
		{ id: 4, r: 45, offset: 4000 }
	];
	$: $minWidth = Math.min(width, height);
	$: speed = Math.min(y / PLAYER_ROTATION_RATIO, 15);
	$: size = ($minWidth * Math.min(Math.max(ticks * BLACK_HOLE_GROWTH, 20), 400)) / 1080;

	onMount(() => {
		const interval = setInterval(tick, 33);
		let obstacleInterval: ReturnType<typeof setInterval>;
		let obstacleSetInterval = setTimeout(() => {
			obstacleInterval = setInterval(obstacleChange, 1000);
		}, 5000);
		return () => {
			clearTimeout(obstacleSetInterval);
			clearInterval(interval);
			clearInterval(obstacleInterval);
		};
	});

	function setScreenSize() {
		width = window.innerWidth;
		height = window.innerHeight;
	}

	function randomIntFromInterval(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	function getRandomObstacleRadio() {
		return randomIntFromInterval(0, 7) * 45;
	}

	function obstacleChange() {
		obstacles[obstacleChangeIndex].r = getRandomObstacleRadio();
		obstacleChangeIndex++;
	}

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
	on:resize={setScreenSize}
/>

<div class="flex items-center justify-center w-screen h-screen">
	{#if DEBUG}
		<div class="absolute top-0 left-0 text-white">
			<p>left:{left}</p>
			<p>right:{right}</p>
			<p>x:{x}</p>
			<p>y:{y}</p>
			<p>speed:{speed}</p>
			<p>size:{size}</p>
		</div>
	{/if}
	{#each obstacles as obstacle (obstacle.id)}
		<Obstacle r={obstacle.r} offset={obstacle.offset} />
	{/each}
	<BlackHole {size} />
	<Player bind:x bind:y />
</div>
