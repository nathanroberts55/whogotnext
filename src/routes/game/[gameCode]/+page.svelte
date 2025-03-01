<script lang="ts">
	import type { PageData } from './$types';
	import QueueDisplay from '$lib/components/QueueDisplay.svelte';

	export let data: PageData;

	async function handleLeaveGame() {
		if (!data.currentPlayer) return;

		try {
			const response = await fetch(`/games-api/${data.gameData.gameCode}/leave`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ playerId: data.currentPlayer.id })
			});

			if (!response.ok) {
				throw new Error('Failed to leave game');
			}

			// Redirect to home page or show success message
			window.location.href = '/';
		} catch (error) {
			console.error('Error leaving game:', error);
		}
	}
</script>

<svelte:head>
	<title>Joined Game - Code: {data.gameData.gameCode}</title>
</svelte:head>

<div class="container mx-auto my-auto flex flex-col p-4 text-center">
	<h1 class="mb-4 text-2xl font-bold">Join Basketball Game: {data.gameData.gameCode}</h1>

	{#if data.gameData.location}
		<p class="mb-4 text-gray-600">Location: {data.gameData.location}</p>
	{/if}

	{#if data.currentPlayer}
		<div class="mb-4 rounded bg-green-100 p-4">
			<p>You are checked in as: {data.currentPlayer.name}</p>
			<button class="btn btn-error mt-2" on:click={handleLeaveGame}> Leave Game </button>
		</div>
	{/if}

	<QueueDisplay players={data.gameData.playersCheckedIn} />
</div>
