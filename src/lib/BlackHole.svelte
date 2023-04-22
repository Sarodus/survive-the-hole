<script lang="ts">
	export let size = 0;
	$: blur = 200 / size;
</script>

<div
	style:--blur="{blur}px"
	style:--size="{size}px"
	id="hole"
	class="
    bg-black
    absolute
    rounded-full
    border-4
    border-solid
    border-violet-800
    border-t-violet-400
    border-t-8
    animate-spin
"
/>

<style>
	#hole {
		width: var(--size);
		height: var(--size);
		animation-duration: 12s;
		filter: blur(var(--blur)) drop-shadow(1px -2px 12px #a21caf);
	}
</style>
