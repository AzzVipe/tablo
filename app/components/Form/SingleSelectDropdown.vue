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

	const selectUi = computed(() => ({
		item: "!p-0",
		base: variantStyles.value.selectClass,
		itemLeadingIcon: variantStyles.value.iconSize,
	}));
</script>

<template>
	<USelectMenu
		v-model="label"
		by="id"
		name="label"
		label-key="name"
		:items="dropdownOptions"
		:ui="selectUi"
		:content="uiMenuValue"
		:required="props.config.required"
		:search-input="true"
		:placeholder="`Select ${header.name}`"
		creatable
		clear-search-on-close>
		<template #item="{ item }">
			<div class="font-normal w-full p-2 rounded-md" :class="item.class">
				<div class="flex gap-1 items-center" :class="optionWrapperClass">
					<span :class="variantStyles.optionClass">{{ item.name }}</span>
					<UIcon v-if="item.icon" :name="item.icon" class="size-4" />
					<!-- TODO: Checked icon -->
				</div>
			</div>
		</template>

		<template #item-create="{ item }">
			<span class="shrink-0">New option:</span>
			<span class="block truncate">{{ item.name }}</span>
		</template>
	</USelectMenu>
</template>
