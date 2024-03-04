<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Timeline from './lib/Timeline.svelte';

	const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
	<div class="flex w-full justify-center">
		<Timeline />
	</div>
</QueryClientProvider>
