<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import BlackHole from '$lib/BlackHole.svelte';
	import Player from '$lib/Player.svelte';
	import Obstacle from '$lib/Obstacle.svelte';
	import { installStore, lost, screenSize } from '../store';

	const DEBUG = dev;
	const STARTING_PLAYER_DISTANCE = 5;
	const PLAYER_SPEED = 0.033;
	const ROTATION_SPEED = 10;
	const TICK_INTERVAL = 33;

	type Obstacle = {
		radius: number;
		collided: boolean;
		duration: number;
	};

	let obstacleSpawnTime = 1000;
	let obstacleDuration = 5000;
	let idx = 0;

	let holeSize = 20;
	let left = false;
	let right = false;
	let x = 0;
	let playerDistance = STARTING_PLAYER_DISTANCE;
	let ticks = 0;
	let startTime = 0;
	let obstacleTimeout: number;
	let obstacles: Map<Symbol, Obstacle> = new Map();
	let collisionChecks: Set<number> = new Set();

	onMount(() => {
		startTime = +new Date();
		const tickInterval = setInterval(tick, TICK_INTERVAL);
		return () => {
			collisionChecks.forEach((x) => clearTimeout(x));
			clearInterval(tickInterval);
			clearTimeout(obstacleTimeout);
		};
	});

	function obstacleSpawn() {
		const index = Symbol();
		const radius = getRandomObstacleRadio();

		obstacles.set(index, {
			collided: false,
			radius,
			duration: obstacleDuration
		});
		obstacles = obstacles;

		obstacleTimeout = setTimeout(obstacleSpawn, obstacleSpawnTime);
		setTimeout(() => {
			obstacles.delete(index);
			obstacles = obstacles;
		}, obstacleDuration);

		// Cahos start with the two trains collision problem :D
		const timeToGetPlayer = obstacleDuration * (1 - playerDistance / 100);
		const percentageToGetPlayerAtActualPosition = (timeToGetPlayer * 100) / obstacleDuration;
		const playerWouldMovePercent = (obstacleDuration / TICK_INTERVAL) * PLAYER_SPEED;
		const percentToGetPlayerInFuturePosition =
			percentageToGetPlayerAtActualPosition - playerWouldMovePercent;
		const finalTimeToGetPlayer = (percentToGetPlayerInFuturePosition / 100) * obstacleDuration;

		collisionChecks.add(setTimeout(() => checkCollision(radius), finalTimeToGetPlayer - 10));
	}

	function restart() {
		$lost = false;
		x = 0;
		idx = 0;
		obstacles = new Map();
		playerDistance = STARTING_PLAYER_DISTANCE;
		ticks = 0;
		obstacleTimeout = setTimeout(obstacleSpawn, 0);
	}

	function randomIntFromInterval(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	function getRandomObstacleRadio() {
		return randomIntFromInterval(0, 7) * 45;
	}

	function checkCollision(radius: number) {
		if (!isAngleInRange(x, radius - 45, radius + 45)) {
			endGame();
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
		obstacles.forEach((obstacle) => {
			obstacle.collided = true;
		});
		obstacles = obstacles;
		clearTimeout(obstacleTimeout);
		collisionChecks.forEach((x) => clearTimeout(x));
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
		if (left) x -= ROTATION_SPEED;
		if (right) x += ROTATION_SPEED;
		playerDistance += PLAYER_SPEED;
	}
</script>

<svelte:window
	on:keypress|preventDefault={handleKeyPress}
	on:keydown|preventDefault={handleKeyPress}
	on:keyup|preventDefault={handleKeyUp}
/>

<div class="flex items-center justify-center w-screen h-screen">
	{#if DEBUG}
		<div class="absolute top-0 left-0 text-white">
			<p>left: {left}</p>
			<p>right: {right}</p>
			<p>x: {x}</p>
			<p>playerDistance: {playerDistance}</p>
			<p>obstacleDuration: {obstacleDuration}</p>
			<p>holeSize: {holeSize}</p>
			<p>screenSize: {$screenSize}</p>
		</div>
	{/if}
	{#each [...obstacles] as [index, obstacle] (index)}
		<Obstacle radius={obstacle.radius} collided={obstacle.collided} duration={obstacle.duration} />
	{/each}
	<BlackHole {ticks} bind:size={holeSize} />
	<Player bind:x bind:playerDistance />
</div>

<div class="fixed inset-0 flex">
	{#if $lost}
		<button aria-label="play" on:click={restart} class="w-full h-full" />

		{#if $installStore}
			<button
				aria-label="install"
				on:click={installStore.install}
				class="fixed top-0 right-0 flex items-center justify-center h-10 p-10 bg-purple-500 active:bg-purple-600"
			>
				<span class="text-2xl text-white">Install</span>
			</button>
		{/if}
	{:else}
		<button
			aria-label="left"
			on:pointerdown={(e) => {
				e.preventDefault();
				left = true;
			}}
			on:pointerup={(e) => {
				e.preventDefault();
				left = false;
			}}
			class="w-full h-full"
		/>
		<button
			aria-label="right"
			on:pointerdown={(e) => {
				e.preventDefault();
				right = true;
			}}
			on:pointerup={(e) => {
				e.preventDefault();
				right = false;
			}}
			class="w-full h-full"
		/>
	{/if}
</div>
