<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { client } from '../client';
	import dayjs from 'dayjs';
	import type { Task } from '../types';

	const today = new Date();

	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(today.getDate() - 7);

	const sevenDaysAfter = new Date(today);
	sevenDaysAfter.setDate(today.getDate() + 7);

	const startDate = dayjs().subtract(2, 'week');
	const endDate = dayjs().add(2, 'week');

	const dateRange = Array.from(
		{ length: endDate.diff(startDate, 'day') + 1 },
		(_, i) => startDate.add(i, 'day')
	);

	const query = createQuery<Task[]>({
		queryKey: ['todos'],
		queryFn: async () => {
			const response = await client.get('/733440/tasks', {
				params: {
					start: sevenDaysAgo.toISOString(),
					end: sevenDaysAfter.toISOString(),
				},
			});

			return response.data.map((task: Task) => {
				const start = dayjs(task.start_date).diff(startDate, 'day') + 2;
				const span =
					start + dayjs(task.end_date).diff(dayjs(task.start_date), 'day') + 1;

				return {
					...task,
					start,
					span,
				};
			});
		},
	});
</script>

<main>
	<div class="grid-cols-29 grid grid-rows-12 gap-1 p-4">
		{#each dateRange as date}
			<div>
				<p>{date.format('dd')[0]}{date.format('D')}</p>
			</div>
		{/each}
		{#if $query.isLoading}
			<p>Loading...</p>
		{:else if $query.isError}
			<p>Error: {$query.error.message}</p>
		{:else if $query.isSuccess}
			{#each $query.data.sort((a, b) => a.weight - b.weight) as row, i}
				<div
					style={`grid-column: ${row.start}/${row.span}; grid-row-start: ${i + 2};`}
					class="flex h-16 w-full items-center rounded-md bg-[#d89895]">
					<p class="p-1">{row.name}</p>
				</div>
			{/each}
		{/if}
	</div>
</main>
