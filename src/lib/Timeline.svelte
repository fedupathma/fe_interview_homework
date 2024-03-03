<style lang="postcss">
	.logo {
		color: #8b55dd;
		display: block;
		flex: none;
		background: currentColor;
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		width: 1.8333ex;
		height: 1.8333ex;
		mask-image: url('../assets/logo-symbol.svg');
	}
</style>

<script>
	import { createQuery } from "@tanstack/svelte-query";
	import { client } from "../client";

	const today = new Date();

	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(today.getDate() - 7);

	const sevenDaysAfter = new Date(today);
	sevenDaysAfter.setDate(today.getDate() + 7);


	const query = createQuery({
    queryKey: ['todos'],
    queryFn: () => client.get('/733440/tasks', {
		params: {
			start: sevenDaysAgo.toISOString(),
			end: sevenDaysAfter.toISOString(),
		}
	}),
  })
</script>

<main class="flex min-h-screen items-center justify-center">
	<div class="flex flex-col items-center">
		<h1 class="text-4xl font-bold mb-4">
			<span class="logo">📅</span> Timeline
		</h1>
		{#if $query.isLoading}
			<p>Loading...</p>
		{:else if $query.isError}
			<p>Error: {$query.error.message}</p>
		{:else if $query.isSuccess}
			<pre>{JSON.stringify($query.data, null,2)}</pre>
		{/if}

	</div>
</main>
