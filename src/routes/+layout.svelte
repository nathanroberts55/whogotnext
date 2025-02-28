<script lang="ts">
	import '../app.css';
	import Navbar from '../lib/Navbar.svelte';
	import Footer from '../lib/Footer.svelte';
	let { children } = $props();
</script>

<Navbar />
<main class="mx-auto flex w-full grow flex-col">
	{@render children()}
</main>
<Footer />
