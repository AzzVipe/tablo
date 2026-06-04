<template>
	<div class="flex items-center justify-center" role="status">
		<svg
			aria-hidden="true"
			class="animate-spin"
			:style="{ width: computedSize, height: computedSize }"
			:class="colorClass"
			viewBox="0 0 50 50"
			xmlns="http://www.w3.org/2000/svg">
			<circle
				class="opacity-25"
				cx="25"
				cy="25"
				r="20"
				stroke="currentColor"
				stroke-width="5"
				fill="none" />
			<path
				class="opacity-75"
				:fill="fillColor"
				d="M25 5a20 20 0 0 1 20 20h-4a16 16 0 0 0-16-16V5z" />
		</svg>
		<span class="sr-only">Loading...</span>
	</div>
</template>

<script setup>
	import { computed } from "vue";

	const props = defineProps({
		size: {
			type: [String, Number], // Allow both "md" or "32px"
			default: "md",
		},
		color: {
			type: String,
			default: "white", // Default to white
		},
	});

	const sizeMap = {
		sm: "24px",
		md: "32px",
		lg: "40px",
		xl: "48px",
	};

	const computedSize = computed(() => {
		return (
			sizeMap[props.size] ||
			(typeof props.size === "number" ? `${props.size}px` : props.size)
		);
	});

	const colorClass = computed(() => `text-${props.color}`);
	const fillColor = computed(() => `currentColor`);
</script>
