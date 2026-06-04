<script setup>
	const props = defineProps({
		header: {
			type: Object,
			required: true,
		},
		modelValue: {
			default: () => "",
		},
		options: {
			type: Array,
			default: () => [],
		},
		config: {
			type: Object,
			default: () => ({
				prefix: "field",
				variant: "default",
				required: false,
			}),
		},
	});

	const emit = defineEmits(["update:modelValue"]);

	const isMounted = ref(false);
	const isSyncingFromParent = ref(false);
	const selected = ref([]);
	const dropdownOptions = ref([]);

	if (props.options.length > 0) {
		dropdownOptions.value = props.options.map((option, index) => ({
			...option,
			id: index + 1,
		}));
	} else if (props.header.options?.length > 0) {
		dropdownOptions.value = props.header.options.map((option, index) => ({
			...option,
			id: index + 1,
		}));
	}

	watch(
		() => props.modelValue,
		(val) => {
			isSyncingFromParent.value = true;

			if (isNullOrUndefinedOrEmpty(val)) {
				selected.value = null;

				nextTick(() => {
					isSyncingFromParent.value = false;
				});

				return;
			}

			const option = dropdownOptions.value.find(
				(option) => option.value === val
			);

			if (option) {
				selected.value = option;
			} else {
				const custom = {
					id: dropdownOptions.value.length + 1,
					name: val,
					value: val,
				};

				dropdownOptions.value.push(custom);

				selected.value = custom;
			}

			nextTick(() => {
				isSyncingFromParent.value = false;
			});
		},
		{ immediate: true }
	);

	const label = computed({
		get: () => selected.value || {},
		set: (val) => {
			if (!val?.id) {
				const response = {
					id: dropdownOptions.value.length + 1,
					name: val.name,
					value: val.name,
				};
				dropdownOptions.value.push(response);
				selected.value = response;
				return;
			}
			selected.value = val;
		},
	});

	onMounted(() => (isMounted.value = true));

	watch(selected, (newVal, oldVal) => {
		if (!isMounted.value) return;

		if (isSyncingFromParent.value) {
			return;
		}

		if (newVal?.value === oldVal?.value) {
			return;
		}

		emit("update:modelValue", newVal?.value ?? null);
	});

	const { variantStyles, uiMenuValue, optionWrapperClass } = useDropdownStyles(
		props.config.variant,
		dropdownOptions.value,
		props.header
	);
</script>

<template>
	<USelectMenu
		:ui="{
			size: variantStyles.selectSize,
			icon: { size: variantStyles.iconSize },
		}"
		:selectClass="variantStyles.selectClass"
		:uiMenu="uiMenuValue"
		clear-search-on-close
		v-model="label"
		by="id"
		name="label"
		:options="dropdownOptions"
		option-attribute="name"
		searchable
		creatable
		:required="props.config.required">
		<template #label>
			<div :class="variantStyles.labelClass">
				<template v-if="label?.name">
					<span class="ml-2">
						{{ label.name }}
					</span>
				</template>
				<template v-else>
					<span class="truncate">Select {{ props.header.name }}</span>
				</template>
			</div>
		</template>

		<template #option="{ option }">
			<div
				class="!font-normal w-full rounded-md py-1.5 px-1.5"
				:class="option.class"
				:style="getOptionColor(option, props.header)">
				<div class="flex gap-1 items-center" :class="optionWrapperClass">
					<span :class="variantStyles.optionClass">{{ option.name }}</span>
					<UIcon v-if="option?.icon" :name="option.icon" class="w-4 h-4" />
				</div>
			</div>
		</template>

		<template #option-create="{ option }">
			<span class="flex-shrink-0">New option:</span>
			<span class="block truncate">{{ option.name }}</span>
		</template>
	</USelectMenu>
</template>
