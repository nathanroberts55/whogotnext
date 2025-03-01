<script lang="ts">
	interface Player {
		id: string;
		name: string;
		arrivalTime: string;
	}

	export let players: Player[] = [];
</script>

<div class="mx-auto mt-8 flex flex-col">
	<h2 class="mb-2 text-xl font-semibold">Players Checked In ({players.length})</h2>
	{#if players.length > 0}
		<ol class="list-decimal pl-5">
			{#each players as player, index (player.id)}
				<li class="mb-1">{player.name}</li>
			{/each}
		</ol>
	{:else}
		<p>No players checked in yet.</p>
	{/if}
</div>
