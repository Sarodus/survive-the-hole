<script lang="ts">
	export let x = 0;
	export let r = 0;
</script>

<div
	style:--size="{500}px"
	class="
    obstacle
    absolute
    rounded-full
    border-4
    border-solid
    border-violet-800
    border-t-transparent
    border-t-4
"
/>

<style>
	.obstacle {
		transform: scale(1);
		width: var(--size);
		height: var(--size);
		scale: 5;
		overflow: hidden;
		animation: scale 5s linear infinite;
		/* animation-duration: 12s; */
		/* filter: blur(var(--blur)) drop-shadow(1px -2px 12px #a21caf); */
	}

	@keyframes scale {
		to {
			transform: scale(0);
		}
	}
</style>
