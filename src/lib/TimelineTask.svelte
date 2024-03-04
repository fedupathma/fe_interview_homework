<script lang="ts">
	import dayjs from 'dayjs';
	import type { Task } from '../types';
	import { draggable } from '@neodrag/svelte';

	export let row: Task;

	let dragPosition = { x: 0, y: 0 };
</script>

<div
	use:draggable={{
		axis: 'x',
		grid: [64, 12],
		onDragEnd: ({ offsetX }) => {
			const daysMoved = offsetX / 64 + 1;
			if (daysMoved < 0) {
				const newDate = dayjs(row.start_date)
					.subtract(Math.abs(daysMoved), 'day')
					.toISOString();
			} else if (daysMoved > 0) {
				const newDate = dayjs(row.start_date)
					.add(Math.abs(daysMoved), 'day')
					.toISOString();
				console.log({ newDate });
			}

			// potentially debounce the persisting of the new date
			//maybe also optimistically set query data.
		},
		position: dragPosition,
		onDrag: ({ offsetX, offsetY }) => {
			dragPosition = { x: offsetX, y: offsetY };
		},
		bounds: 'parent',
	}}
	style={`grid-column: ${row.start}/${row.span}; grid-row-start: ${row.row};`}
	class="flex h-16 w-full items-center rounded-md bg-[#d89895]">
	<p class="p-1">{row.name}</p>
</div>
