<script setup>
	import { defineProps, defineEmits } from "vue";

	const { label, popoverOpen, styles, actStyles } = defineProps([
		"label",
		"popoverOpen",
		"styles",
		"actStyles",
	]);

	const emit = defineEmits(["tap"]);

	const defaultStyles = "secondary-button-outline";

	const defaultActStyles =
		"!border-[var(--input-focus-border)] !shadow !shadow-[var(--orange-shadow)]";
</script>

<template>
	<UTooltip :text="label">
		<button
			type="button"
			@click="emit('tap')"
			:class="[
				styles || defaultStyles,
				popoverOpen ? actStyles || defaultActStyles : '',
			]">
			<slot>
				<UIcon name="ic:baseline-arrow-drop-down" class="w-5 h-5" />
			</slot>
		</button>
	</UTooltip>
</template>
