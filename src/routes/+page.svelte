<script lang="ts">
	import { onMount } from 'svelte';
	import BlackHole from '$lib/BlackHole.svelte';
	import Player from '$lib/Player.svelte';
	import Obstacle from '$lib/Obstacle.svelte';
	import { lost, minWidth } from '../store';
	import { tweened } from 'svelte/motion';

	const BLACK_HOLE_GROWTH = 0.1;
	const PLAYER_SPEED = 0.1;
	const PLAYER_ROTATION_RATIO = 20;
	const DEBUG = true;
	const OBSTACLES = 5;
	const OBSTACLE_HURT = 20;
	const DEATH_OFFSET = 20;

	type Obstacle = {
		index: number;
		r: number;
		collided: boolean;
		hide: boolean;
	};

	let left = false;
	let right = false;
	let x = 0;
	let y = 100;
	let ticks = 0;
	let width = 1920;
	let height = 1080;
	let startTime = 0;
	let obstacleChangeIndex = 0;
	let obstacleTimeout: number;
	let obstacles: Obstacle[] = [];
	let collisionChecks: number[] = [];

	const size = tweened(20, { duration: 400 });

	$: $minWidth = Math.min(width, height);
	$: speed = Math.min(y / PLAYER_ROTATION_RATIO, 15);
	$: if ($lost) {
		$size = 400;
	} else {
		$size = ($minWidth * Math.min(Math.max(ticks * BLACK_HOLE_GROWTH, 20), 400)) / 1080;
	}

	onMount(() => {
		setScreenSize();
		startTime = +new Date();
		const tickInterval = setInterval(tick, 33);
		const obstacleSetInterval = setTimeout(() => obstacleChange(), 1000);
		return () => {
			clearTimeout(obstacleSetInterval);
			clearInterval(tickInterval);
			clearInterval(obstacleTimeout);
		};
	});

	function restart() {
		$lost = false;
		x = 0;
		y = 100;
		ticks = 0;
		console.log('RESTART');
	}

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
		const index = obstacleChangeIndex % OBSTACLES;
		const r = getRandomObstacleRadio();
		obstacles[index] = { index, r, collided: false, hide: $lost };
		obstacleChangeIndex++;
		const timeToCheckMs = (1000 - 10 - y) * 5;

		if (!$lost) {
			collisionChecks[index] = setTimeout(() => checkCollision(index), timeToCheckMs);
		}
		const time = +new Date();
		const timeCorrection = (time - startTime) % 1000;
		obstacleTimeout = setTimeout(obstacleChange, 1000 - timeCorrection);
	}

	function checkCollision(obstacleIndex: number) {
		const obstacle = obstacles[obstacleIndex];
		const r = obstacle.r;

		if (!isAngleInRange(x, r - 45, r + 45)) {
			obstacles[obstacleIndex].collided = true;
			y -= OBSTACLE_HURT;
			if (y - DEATH_OFFSET < $size) {
				endGame();
			}
		}
	}

	function isAngleInRange(angle: number, start: number, end: number) {
		angle = ((angle % 360) + 360) % 360;
		start = ((start % 360) + 360) % 360;
		end = ((end % 360) + 360) % 360;
		if (start < end) return angle >= start && angle <= end;
		return angle >= start || angle <= end;
	}

	function endGame() {
		if ($lost) return;
		$lost = true;
		right = left = false;
		obstacles = obstacles.map((o) => ({
			...o,
			collided: true,
			hide: true
		}));
		collisionChecks.map((x) => clearTimeout(x));
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
			case 'Space':
			case 'Enter':
				if ($lost) restart();
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
		ticks++;
		if ($lost) return;
		if (left) x -= speed;
		if (right) x += speed;
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
			<p>size:{$size}</p>
		</div>
	{/if}
	{#each obstacles as obstacle (obstacle.index)}
		{#if !obstacle.hide}
			<Obstacle r={obstacle.r} collided={obstacle.collided} />
		{/if}
	{/each}
	<BlackHole size={$size} />
	<Player bind:x bind:y />
</div>

<div class="fixed inset-0 flex">
	{#if $lost}
		<button on:click={restart} class="w-full h-full" />
	{:else}
		<button
			on:pointerdown={() => (left = true)}
			on:pointerup={() => (left = false)}
			class="w-full h-full"
		/>
		<button
			on:pointerdown={() => (right = true)}
			on:pointerup={() => (right = false)}
			class="w-full h-full"
		/>
	{/if}
</div>
