<script lang="ts">
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';

	const FILE_PATH = 'routes/game/join/+page.svelte';
	let gameCodeInput = ''; // Bind to input field
	let nameInput = ''; // Bind to input field
	let errorMessage: string | null = null;
	let joiningGame = false; // To disable button during request

	async function handleSubmit() {
		console.log(`[${FILE_PATH}] Starting form submission`);
		console.log(`[${FILE_PATH}] GameCode input: ${gameCodeInput}, Name input: ${nameInput}`);

		joiningGame = true;
		errorMessage = null;

		try {
			console.log(`[${FILE_PATH}] Making POST request to /games-api/${gameCodeInput}/checkin`);
			const response = await fetch(`/games-api/${gameCodeInput}/checkin`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ playerName: nameInput })
			});

			console.log(`[${FILE_PATH}] Response status:`, response.status);

			if (!response.ok) {
				const errorData = await response.json();
				console.error(`[${FILE_PATH}] Error response:`, errorData);
				errorMessage = errorData.message || 'Failed to join game';
				return;
			}

			const data = await response.json();
			console.log(`[${FILE_PATH}] Success response:`, data);

			// Navigate to the game page
			await goto(`/game/${data.gameCode}`);
		} catch (error) {
			console.error(`[${FILE_PATH}] Error:`, error);
			errorMessage = `Error joining game: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			joiningGame = false;
		}
	}
</script>

<svelte:head>
	<title>Who Got Next? - Join a Game</title>
</svelte:head>

<div class="mx-auto my-auto flex flex-col">
	<h1 class="mb-4 text-center text-4xl">Join a Game</h1>
	<form
		class="mx-auto flex flex-col space-y-4"
		method="POST"
		on:submit|preventDefault={handleSubmit}
	>
		<div class=" my-4 flex flex-col space-y-2">
			<input
				type="text"
				placeholder="Name"
				class="input input-bordered w-full max-w-xs text-center"
				required
				bind:value={nameInput}
			/>
			<input
				type="text"
				placeholder="Game Code"
				class="input input-bordered w-full max-w-xs text-center"
				required
				bind:value={gameCodeInput}
			/>
		</div>

		<button type="submit" class="btn btn-primary" disabled={joiningGame}>
			{#if joiningGame}
				Joining Game...
			{:else}
				Join
			{/if}
		</button>
		{#if errorMessage}
			<p class="mt-2 text-red-500">{errorMessage}</p>
		{/if}
	</form>
</div>
