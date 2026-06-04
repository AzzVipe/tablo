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
		color: {
			white: {
				outline: "shadow-none",
			},
		},
	};
</script>

<template>
	<USelectMenu
		:model-value="modelValue"
		@update:model-value="emit('update:modelValue', $event)"
		@change="emit('change')"
		:placeholder="placeholder"
		:ui="{ ...uiStyle, ...ui }"
		:uiMenu="{ container: 'z-20 group', width: 'w-fit' }"
		selectClass="input-box-dropdown-sm"
		:options="options"
		:option-attribute="optAttr"
		:value-attribute="valAttr"
		required>
		<template #option="{ option: opt }">
			<span class="whitespace-nowrap mr-1 pr-1">
				{{ opt[optAttr] }}
			</span>
		</template>
	</USelectMenu>
</template>
