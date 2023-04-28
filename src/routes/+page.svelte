<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import BlackHole from '$lib/BlackHole.svelte';
	import Player from '$lib/Player.svelte';
	import Obstacle from '$lib/Obstacle.svelte';
	import Objective from '$lib/Objective.svelte';
	import { fade } from 'svelte/transition';
	import { idle, installStore, titleScreen, screenSize, win } from '../store';
	import { LEVELS, type Level } from '../level';
	import { assets } from '$app/paths';

	const DEBUG = dev;
	const STARTING_PLAYER_DISTANCE = 5;
	const OBJECTIVE_LOOP_TIME = 10_000;
	const PLAYER_SPEED = 0.033;
	const TICK_INTERVAL = 33;

	type Obstacle = {
		radius: number;
		collided: boolean;
		duration: number;
	};

	let level: Level;
	let idx = 0;
	let loaded = false;
	let loading = false;
	let restartSong = 0;
	let showQr = false;

	let holeSize = 20;
	let left = false;
	let right = false;
	let spin = true;
	let x = 0;
	let bpm = 0;
	let playerDistance = STARTING_PLAYER_DISTANCE;
	let ticks = 0;
	let startTime = 0;
	let obstacleTimeout: number;
	let obstacles: Map<Symbol, Obstacle> = new Map();
	let collisionChecks: Set<number> = new Set();

	$: if (level?.audio) {
		level.audio.currentTime = 0;
		level.audio?.play();
	}

	$: OBJECTIVE_DISTANCE = level?.targetDistance;
	$: obstacleDuration = level?.obstacleDuration;
	$: musicTick = 60000 / level?.bpm ?? 1;
	$: fontSize = $screenSize / 20;

	onMount(() => {
		const tickInterval = setInterval(tick, TICK_INTERVAL);
		return () => {
			LEVELS.forEach((level) => {
				level.audio?.pause();
			});
			collisionChecks.forEach((x) => clearTimeout(x));
			clearInterval(tickInterval);
			clearTimeout(obstacleTimeout);
		};
	});

	async function preLoadSongs() {
		if (loading) return;
		loading = true;
		const loadSongs = LEVELS.map((level) => {
			return new Promise((resolve, reject) => {
				level.audio = new Audio(level.src);
				level.audio.loop = true;
				level.audio?.load();
				level.audio.onended = () => restartSong++;
				level.audio.oncanplay = resolve;
				level.audio.onerror = reject;
			});
		});
		try {
			await Promise.all(loadSongs);
		} catch (error) {
		} finally {
			loaded = true;
			loading = false;
			level = LEVELS[2];
		}
	}

	function obstacleSpawn() {
		const index = Symbol();
		const radius = getRandomObstacleRadio();

		obstacles.set(index, {
			collided: false,
			radius,
			duration: obstacleDuration
		});
		obstacles = obstacles;

		obstacleTimeout = setTimeout(obstacleSpawn, musicTick);
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
		showQr = false;
		startTime = +new Date();
		$titleScreen = false;
		x = 0;
		idx = 0;
		obstacles = new Map();
		playerDistance = STARTING_PLAYER_DISTANCE;
		ticks = 0;
		$win = false;
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
		if ($titleScreen) return;
		$titleScreen = true;
		right = left = false;
		obstacles.forEach((obstacle) => {
			obstacle.collided = true;
		});
		obstacles = obstacles;
		clearTimeout(obstacleTimeout);
		collisionChecks.forEach((x) => clearTimeout(x));
	}

	function winGame() {
		right = left = false;
		clearTimeout(obstacleTimeout);
		collisionChecks.forEach((x) => clearTimeout(x));
		$win = true;
		setTimeout(() => {
			$titleScreen = true;
		}, 2000);
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
				if (!loaded) preLoadSongs();
				else if ($titleScreen) restart();
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
		if ($titleScreen) return;
		if ($win) playerDistance += PLAYER_SPEED * 50;
		if ($win) return;
		if (left) x -= level.playerSpeed;
		if (right) x += level.playerSpeed;
		playerDistance += PLAYER_SPEED;
		checkWin();
	}

	function checkWin() {
		if (!(playerDistance >= OBJECTIVE_DISTANCE - 5 && playerDistance <= OBJECTIVE_DISTANCE + 5))
			return;
		const now = +new Date() - startTime;
		const angle = (360 * (now % OBJECTIVE_LOOP_TIME)) / OBJECTIVE_LOOP_TIME;
		if (isAngleInRange(x, angle - 5, angle + 5)) {
			winGame();
		}
	}

	function onChangeVisibility() {
		if (document.hidden) {
			level?.audio?.pause();
		} else {
			level?.audio?.play();
			level = level;
		}
	}
</script>

<svelte:window
	on:visibilitychange={onChangeVisibility}
	on:keypress|preventDefault={handleKeyPress}
	on:keydown|preventDefault={handleKeyPress}
	on:keyup|preventDefault={handleKeyUp}
/>

{#if DEBUG}
	<div class="absolute top-0 left-0 mt-20 text-white">
		<p>loaded: {loaded}</p>
		<p>loading: {loading}</p>
		<p>left: {left}</p>
		<p>right: {right}</p>
		<p>x: {x}</p>
		<p>playerDistance: {playerDistance}</p>
		<p>obstacleDuration: {obstacleDuration}</p>
		<p>holeSize: {holeSize}</p>
		<p>screenSize: {$screenSize}</p>
		<p>win: {$win}</p>
		<p>bpm: {bpm}</p>
		<p>restartSong: {restartSong}</p>
	</div>
{/if}

{#key level}
	<div
		style:--bpm="{musicTick}ms"
		id="game"
		class:spin
		class="relative flex items-center justify-center w-screen h-screen overflow-hidden spin"
	>
		<Objective distance={OBJECTIVE_DISTANCE} timeToLoop={OBJECTIVE_LOOP_TIME} />
		{#each [...obstacles] as [index, obstacle] (index)}
			<Obstacle
				radius={obstacle.radius}
				collided={obstacle.collided}
				duration={obstacle.duration}
			/>
		{/each}
		<BlackHole {ticks} bind:size={holeSize} />
		<Player bind:x bind:playerDistance />
	</div>
{/key}

{#if $idle}
	<div
		style:font-size="{fontSize}px"
		class="fixed inset-0 z-10 w-full h-full text-white transition-all duration-500"
		in:fade={{ duration: 1000 }}
		out:fade={{ duration: 200 }}
	>
		<div class="flex items-center justify-center h-full">
			{#if loading}
				<span>Loading...</span>
			{:else if !loaded}
				<span>You're not safe...</span>
			{:else if $win}
				<span in:fade>You're safe now</span>
			{:else}
				<span transition:fade>Survive the hole</span>
			{/if}
		</div>
	</div>
{/if}

{#if showQr}
	<button
		transition:fade
		class="fixed bottom-0 right-0 z-[100] w-full h-full max-w-lg max-h-[512px] bg-black"
		on:click={() => (showQr = false)}
	>
		<img alt="https://survive-the-hole.vercel.app/" src="{assets}/qr.svg" />
	</button>
{/if}

<div class="fixed inset-0 z-50 flex">
	{#if $titleScreen}
		{#if !loaded}
			<button aria-label="play" on:click={preLoadSongs} class="w-full h-full" />
		{:else if !loading}
			<button aria-label="play" on:click={restart} class="w-full h-full" />
		{/if}

		<button
			out:fade
			in:fade={{ duration: 3000 }}
			aria-label="spin"
			on:click={() => (spin = !spin)}
			class="fixed top-0 left-0 flex items-center justify-center h-10 p-10 bg-purple-500 active:bg-purple-600"
		>
			<span class:spin class="text-2xl text-white" class:opacity-50={!spin}>Spin</span>
		</button>

		{#if $installStore}
			<button
				out:fade
				in:fade={{ duration: 3000 }}
				aria-label="install"
				on:click={installStore.install}
				class="fixed top-0 right-0 flex items-center justify-center h-10 p-10 bg-purple-500 active:bg-purple-600"
			>
				<span class="text-2xl text-white">Install</span>
			</button>
		{/if}

		<button
			out:fade
			in:fade={{ duration: 3000 }}
			aria-label="install"
			on:click={() => (showQr = true)}
			class="fixed bottom-0 right-0 flex items-center justify-center h-10 p-10 bg-purple-500 active:bg-purple-600"
		>
			<span class="text-2xl text-white">QR</span>
		</button>

		{#if loaded}
			<div transition:fade class="absolute bottom-0">
				<select
					id="level"
					out:fade
					in:fade={{ duration: 3000 }}
					aria-label="level"
					on:change={() => {
						$win = false;
						level?.audio?.pause();
					}}
					on:click={installStore.install}
					class="p-4 text-white bg-purple-500 text-whitez active:bg-purple-600"
					bind:value={level}
				>
					<option disabled value="" />
					{#each LEVELS as lvl}
						<option value={lvl}>{lvl.name}</option>
					{/each}
				</select>
			</div>
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

<style>
	.spin {
		animation: spin 10s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
