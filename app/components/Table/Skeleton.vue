<script setup>
	defineProps({
		style: { type: String, default: "" },
	});

	const rows = Array.from({ length: 6 }, (_, i) => i);
	const widths = ["w-48", "w-32", "w-full", "w-40", "w-24", "w-36"];
	const randomWidth = (i) => widths[i % widths.length];
</script>

<template>
	<div :class="`flex flex-col ${style}`">
		<!-- Toolbar skeleton -->
		<div
			class="flex items-center gap-2 px-1 py-3 border-b border-[var(--input-border)]">
			<div
				class="h-7 w-16 rounded-lg bg-[var(--table-skeleton)] animate-pulse" />
			<div
				class="h-7 w-16 rounded-lg bg-[var(--table-skeleton)] animate-pulse" />
			<div
				class="h-7 w-16 rounded-lg bg-[var(--table-skeleton)] animate-pulse" />
			<div
				class="ml-auto h-7 w-20 rounded-lg bg-[var(--table-skeleton)] animate-pulse" />
		</div>

		<!-- Header skeleton -->
		<div
			class="flex items-center gap-4 px-3 py-3 border-b border-[var(--input-border)]">
			<div
				class="h-3 w-4 rounded bg-[var(--table-skeleton)] animate-pulse flex-shrink-0" />
			<div
				class="h-2.5 w-28 rounded-full bg-[var(--table-skeleton)] animate-pulse" />
			<div
				class="h-2.5 w-24 rounded-full bg-[var(--table-skeleton)] animate-pulse" />
			<div
				class="h-2.5 w-32 rounded-full bg-[var(--table-skeleton)] animate-pulse" />
			<div
				class="h-2.5 w-20 rounded-full bg-[var(--table-skeleton)] animate-pulse" />
			<div
				class="h-2.5 w-24 rounded-full bg-[var(--table-skeleton)] animate-pulse ml-auto" />
		</div>

		<!-- Row skeletons -->
		<div class="flex flex-col gap-1.5 pt-1.5">
			<div
				v-for="row in rows"
				:key="row"
				class="flex items-center gap-4 px-3 py-3 rounded-lg bg-[var(--table-row)] animate-pulse"
				:style="{ opacity: 1 - row * 0.1 }">
				<!-- Checkbox -->
				<div class="h-4 w-4 rounded bg-[var(--table-skeleton)] flex-shrink-0" />

				<!-- Title — wider -->
				<div
					class="h-2.5 rounded-full bg-[var(--table-skeleton)]"
					:class="randomWidth(row + 1)" />

				<!-- Date -->
				<div class="h-2.5 w-24 rounded-full bg-[var(--table-skeleton)]" />

				<!-- Assigned — avatar circles -->
				<div class="flex gap-1">
					<div class="h-6 w-6 rounded-full bg-[var(--table-skeleton)]" />
					<div class="h-6 w-6 rounded-full bg-[var(--table-skeleton)]" />
				</div>

				<!-- Priority chip -->
				<div class="h-6 w-16 rounded-full bg-[var(--table-skeleton)]" />

				<!-- Label chip -->
				<div class="h-6 w-20 rounded-full bg-[var(--table-skeleton)] ml-auto" />
			</div>
		</div>

		<span class="sr-only">Loading...</span>
	</div>
</template>
