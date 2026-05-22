<template>
	<div class="flex items-center gap-2.5">
		<!-- T mark -->
		<svg
			:width="size"
			:height="size"
			viewBox="0 0 32 32"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true">
			<rect width="32" height="32" rx="6" fill="#26211d" />
			<rect x="5" y="7" width="22" height="7" rx="2.5" fill="#ea580c" />
			<rect
				x="9"
				y="17"
				width="14"
				height="4"
				rx="1.5"
				fill="none"
				stroke="#4a4540"
				stroke-width="1" />
			<rect
				x="9"
				y="24"
				width="14"
				height="4"
				rx="1.5"
				fill="none"
				stroke="#4a4540"
				stroke-width="1" />
		</svg>

		<!-- Wordmark -->
		<div v-if="showName" class="flex flex-col leading-tight">
			<span
				class="text-[var(--text-description)] font-bold text-xl tracking-tight whitespace-nowrap">
				<span>T</span><span class="text-[var(--text-title)]">ablo</span>
			</span>
			<span
				class="text-[var(--text-subtitle)] text-xs font-normal tracking-wide whitespace-nowrap">
				config-driven tables
			</span>
		</div>
	</div>
</template>

<script setup>
	defineProps({
		size: {
			type: Number,
			default: 32,
		},
		showName: {
			type: Boolean,
			default: true,
		},
	});
</script>
