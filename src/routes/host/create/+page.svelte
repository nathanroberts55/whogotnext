<script lang="ts">
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';

	const FILE_PATH = 'routes/host/create/+page.svelte';
	let locationInput = ''; // Bind to input field
	let errorMessage: string | null = null;
	let creatingGame = false; // To disable button during request

	async function handleSubmit() {
		console.log(`[${FILE_PATH}] Starting form submission`);
		console.log(`[${FILE_PATH}] Location input:`, locationInput);

		creatingGame = true;
		errorMessage = null;
		try {
			console.log(`[${FILE_PATH}] Making POST request to /games-api/create-game`);
			const response = await fetch('/games-api/create-game', {
				// API Endpoint path
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ location: locationInput }) // Send location data - even if API ignores it for now
			});
			console.log(`[${FILE_PATH}] Response status:`, response.status);

			if (!response.ok) {
				console.log(`[${FILE_PATH}] Response not OK, getting error details`);
				const errorData = await response.json();
				errorMessage =
					errorData.message || `Failed to create game: ${response.status} ${response.statusText}`;
				console.error(`[${FILE_PATH}] Error:`, errorMessage);
				return;
			}

			console.log(`[${FILE_PATH}] Parsing response data`);
			const data = await response.json();
			console.log(`[${FILE_PATH}] Received data:`, data);

			const gameCode = data.gameCode;
			if (gameCode) {
				console.log(`[${FILE_PATH}] Game code received:`, gameCode);
				console.log(`[${FILE_PATH}] Attempting navigation to /host/game/${gameCode}`);
				try {
					// First invalidate all data
					await invalidateAll();
					// Then navigate to the new page
					await goto(`/host/game/${gameCode}`, {
						replaceState: true // This prevents adding to browser history
					});
					console.log(`[${FILE_PATH}] Navigation successful`);
				} catch (navError) {
					console.error(`[${FILE_PATH}] Navigation failed:`, navError);
					errorMessage = 'Failed to navigate to game page';
					creatingGame = false;
				}
			} else {
				console.error(`[${FILE_PATH}] No game code in response`);
				errorMessage = 'Game code not received from server.';
			}
		} catch (error) {
			console.error(`[${FILE_PATH}] Caught error:`, error);
			errorMessage = `Error creating game: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			console.log(`[${FILE_PATH}] Form submission completed`);
			creatingGame = false; // Re-enable button
		}
	}
</script>

<svelte:head>
	<title>Who Got Next? - Create a Game</title>
</svelte:head>

<div class="mx-auto my-auto flex flex-col">
	<h1 class="mb-4 text-center text-4xl">Create a Game</h1>
	<form
		class="mx-auto flex flex-col space-y-4"
		method="POST"
		on:submit|preventDefault={handleSubmit}
	>
		<div class=" my-4 flex flex-col space-y-2">
			<input
				type="text"
				placeholder="Location (Optional)"
				class="input input-bordered w-full max-w-xs text-center"
				bind:value={locationInput}
			/>
		</div>
		<button type="submit" class="btn btn-primary" disabled={creatingGame}>
			{#if creatingGame}
				Creating Game...
			{:else}
				Create
			{/if}
		</button>
		{#if errorMessage}
			<p class="mt-2 text-red-500">{errorMessage}</p>
		{/if}
	</form>
</div>
