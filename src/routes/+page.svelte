<svelte:head>
	<title>Who Got Next?</title>
</svelte:head>

<div class="container mx-auto my-auto flex flex-col">
	<div class="flex flex-col items-center space-y-4">
		<h1 class="font-display text-8xl">Who Got Next?</h1>
		<p class="text-center text-lg">
			Ready to play? Whether you're at a community center, park, or organized event, Who Got Next?
			helps players coordinate and manage pick-up games. Get started by hosting a new game or
			joining an existing one using the buttons below.
		</p>
		<div class="flex space-x-4">
			<a href="/host/create"><button class="btn btn-neutral btn-md px-10 text-lg">Host</button></a>
			<a href="/game/join/"><button class="btn btn-accent btn-md px-10 text-lg">Join</button></a>
		</div>
	</div>
</div>
