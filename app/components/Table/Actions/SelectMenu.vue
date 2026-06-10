<script setup>
	const { modelValue, placeholder, options, optAttr, valAttr, ui } =
		defineProps([
			"modelValue",
			"placeholder",
			"options",
			"optAttr",
			"valAttr",
			"ui",
		]);

	const emit = defineEmits(["update:modelValue", "change"]);

	const uiStyle = {
		item: "shadow-none",
	};
</script>

<template>
	<USelectMenu
		:model-value="modelValue"
		@update:model-value="emit('update:modelValue', $event)"
		@change="emit('change')"
		:placeholder="placeholder"
		:ui="{ ...uiStyle, ...ui }"
		class="input-box-dropdown-sm"
		:items="options"
		:label-key="optAttr"
		:value-key="valAttr"
		required>
		<template #item="{ item }">
			<span class="whitespace-nowrap mr-1 pr-1">
				{{ item[optAttr] }}
			</span>
		</template>
	</USelectMenu>
</template>
