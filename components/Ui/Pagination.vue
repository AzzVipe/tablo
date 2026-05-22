<script setup>
	const emit = defineEmits(["change"]);

	const { totalPages, currentPage } = defineProps([
		"totalPages",
		"currentPage",
	]);

	const totalDisplayPages = 7;
	const halfDisplayPages = Math.floor(totalDisplayPages / 2);
	let startPage = Math.max(1, currentPage - halfDisplayPages);
	let endPage = Math.min(totalPages, startPage + totalDisplayPages - 1);

	if (endPage - startPage + 1 < totalDisplayPages) {
		startPage = Math.max(1, endPage - totalDisplayPages + 1);
	}

	const pages = Array.from(
		{ length: endPage - startPage + 1 },
		(_, index) => startPage + index
	);

	if (startPage > 1) {
		pages[0] = 1;
		pages[1] = "...";
	}

	if (endPage < totalPages) {
		pages[pages.length - 1] = totalPages;
		pages[pages.length - 2] = "...";
	}

	const goToPage = (page) => {
		emit("change", page);
	};
</script>

<template>
	<nav
		v-if="totalPages > 1"
		aria-label="Page navigation example"
		class="max-md:mx-auto">
		<ul class="inline-flex flex-wrap items-center md:gap-4 gap-2 -space-x-px">
			<li>
				<button
					@click="goToPage(currentPage - 1)"
					class="ghost-button-sm"
					:disabled="currentPage === 1">
					<Icon
						name="ic:round-chevron-left"
						class="w-7 h-7 max-xl:w-6 max-xl:h-6" />
					<span>Prev</span>
				</button>
			</li>

			<li v-for="(page, index) in pages" :key="index">
				<button class="leading-tight w-7 h-7" v-if="page === '...'" disabled>
					...
				</button>
				<button
					v-else
					@click="goToPage(page)"
					class="!rounded-full"
					:class="[
						page === currentPage ? 'primary-button-sm' : 'ghost-button-sm',
					]">
					{{ page }}
				</button>
			</li>

			<li>
				<button
					@click="goToPage(currentPage + 1)"
					class="ghost-button-sm"
					:disabled="currentPage === totalPages">
					<span>Next</span>
					<Icon
						name="ic:round-chevron-right"
						class="w-7 h-7 max-xl:w-6 max-xl:h-6" />
				</button>
			</li>
		</ul>
	</nav>
</template>
