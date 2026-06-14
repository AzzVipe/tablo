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
				<UButton
					@click="goToPage(currentPage - 1)"
					color="secondary"
					variant="ghost"
					label="Prev"
					icon="ic:round-chevron-left"
					:disabled="currentPage === 1" />
			</li>

			<li v-for="(page, index) in pages" :key="index">
				<UButton
					v-if="page === '...'"
					label="..."
					color="secondary"
					variant="outline"
					disabled />

				<UButton
					v-else
					@click="goToPage(page)"
					:label="page.toString()"
					color="secondary"
					variant="outline"
					active-color="primary"
					active-variant="solid"
					class="rounded-full"
					:active="page === currentPage" />
			</li>

			<li>
				<UButton
					@click="goToPage(currentPage + 1)"
					color="secondary"
					variant="ghost"
					label="Next"
					trailing-icon="ic:round-chevron-right"
					:disabled="currentPage === totalPages" />
			</li>
		</ul>
	</nav>
</template>
