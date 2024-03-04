<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { client } from '../client';
	import dayjs from 'dayjs';
	import type { Task } from '../types';
	import TimelineTask from './TimelineTask.svelte';

	const startDate = dayjs().subtract(2, 'week');
	const endDate = dayjs().add(2, 'week');

	const dateRange = Array.from(
		{ length: endDate.diff(startDate, 'day') + 1 },
		(_, i) => startDate.add(i, 'day')
	);

	const gridColumns = 29;
	const gridRows = 20;
	const gridOccupancy = Array.from({ length: gridRows }, () =>
		Array(gridColumns).fill(false)
	);

	function getRow(column: number, span: number) {
		let row = 0;
		for (let r = 2; r < gridRows; r++) {
			let isOccupied = false;
			for (let c = column; c < column + span; c++) {
				if (c < gridColumns) {
					isOccupied = isOccupied || gridOccupancy[r][c];
				}
			}
			if (!isOccupied) {
				//set occupancy
				for (let c = column; c < column + span; c++) {
					if (c < gridColumns) {
						gridOccupancy[r][c] = true;
					}
				}
				row = r;
				break;
			}
		}
		return row;
	}

	const query = createQuery<Task[]>({
		queryKey: ['tasks'],
		queryFn: async () => {
			const response = await client.get('/733440/tasks', {
				params: {
					start: startDate.toISOString(),
					end: endDate.toISOString(),
				},
			});

			return response.data
				.sort((a: Task, b: Task) => a.weight - b.weight)
				.map((task: Task) => {
					const start = dayjs(task.start_date).diff(startDate, 'day') + 2;
					const span =
						start +
						dayjs(task.end_date).diff(dayjs(task.start_date), 'day') +
						1;
					const row = getRow(start, span - start);

					console.log({ start, span, row, name: task.name });
					return {
						...task,
						start,
						span,
						row,
					};
				});
		},
	});

	console.log({ gridOccupancy });
</script>

<main>
	<div class="grid-cols-29 mx-auto grid gap-y-1">
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
				<TimelineTask {row} />
			{/each}
		{/if}
	</div>
</main>
