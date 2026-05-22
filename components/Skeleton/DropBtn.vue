<script setup>
	defineProps({
		style: {
			type: String,
			default: "w-20 h-9", // Default width (Tailwind)
		},
		textStyle: {
			type: String,
			default: "w-8 h-4", // Default text width (Tailwind)
		},
		showIcon: {
			type: Boolean,
			default: true,
		},
		showText: {
			type: Boolean,
			default: true,
		},
	});
</script>

<template>
	<div
		class="inline-flex items-center rounded-md border border-[var(--btn-secondary-border)] animate-pulse px-3 gap-2"
		:class="[style]">
		<div
			v-if="showIcon"
			class="bg-[var(--btn-secondary-bg)] rounded-full w-4 h-4"></div>
		<div
			v-if="showText"
			:class="`${textStyle} bg-[var(--btn-secondary-bg)] rounded`"></div>
	</div>
</template>
