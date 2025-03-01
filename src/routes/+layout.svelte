<script lang="ts">
	import '../app.css';
	import Navbar from '../lib/components/Navbar.svelte';
	import Footer from '../lib/components/Footer.svelte';
	let { children } = $props();
</script>

<Navbar />
<main class="mx-auto flex w-full grow flex-col">
	{@render children()}
</main>
<Footer />
