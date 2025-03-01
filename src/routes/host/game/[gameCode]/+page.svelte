<script lang="ts">
	import type { PageData } from './$types';
	import QueueDisplay from '$lib/components/QueueDisplay.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Hosting Game - Code: {data.gameData.gameCode}</title>
</svelte:head>

<div class="container mx-auto my-auto flex flex-col p-4 text-center">
	<h1 class="mb-4 text-2xl font-bold">Join Basketball Game: {data.gameData.gameCode}</h1>

	{#if data.gameData.location}
		<p class="mb-4 text-gray-600">Location: {data.gameData.location}</p>
	{/if}

	<div class="my-3 flex justify-center space-x-4">
		<button class="btn btn-error">End Game</button>
		<button class="btn btn-secondary">Update Game</button>
	</div>

	<QueueDisplay players={data.gameData.playersCheckedIn} />
</div>
