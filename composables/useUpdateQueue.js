export function useUpdateQueue(bufferMs = 250) {
	const queue = ref([]);
	const isProcessing = ref(false);
	let bufferTimer = null;

	const enqueue = (task) => {
		// collapse: replace existing queued task with same key
		const index = queue.value.findIndex((q) => q.key === task.key);

		if (index !== -1) {
			queue.value[index] = task;
		} else {
			queue.value.push(task);
		}

		// start / reset buffer
		if (bufferTimer) clearTimeout(bufferTimer);

		bufferTimer = setTimeout(() => {
			bufferTimer = null;
			process();
		}, bufferMs);
	};

	const process = async () => {
		if (isProcessing.value) return;
		if (!queue.value.length) return;

		isProcessing.value = true;
		const task = queue.value.shift();

		try {
			await task.run();
		} catch (e) {
			console.error("[QUEUE] task failed:", e);
		} finally {
			isProcessing.value = false;

			// process next immediately (no buffer between tasks)
			if (queue.value.length) {
				process();
			}
		}
	};

	const flush = () => {
		if (bufferTimer) {
			clearTimeout(bufferTimer);
			bufferTimer = null;
		}
		process();
	};

	return {
		enqueue,
		flush,
		isProcessing,
	};
}
