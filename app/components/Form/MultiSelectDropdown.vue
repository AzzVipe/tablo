<script setup>
	const props = defineProps({
		header: {
			type: Object,
			required: true,
		},
		modelValue: {
			type: Array,
			default: () => [],
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

	const selected = ref([]);
	const dropdownOptions = ref([]);
	const isMounted = ref(false);
	const isSyncingFromParent = ref(false);

	// ---- Build options from prop or header ----
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

	// ---- Initialize selected from modelValue ----
	watch(
		() => props.modelValue,
		(val) => {
			isSyncingFromParent.value = true;

			if (!val?.length) {
				selected.value = [];
				isSyncingFromParent.value = false;
				return;
			}

			const normalized = Array.isArray(val) ? val : [val];

			const matched = dropdownOptions.value.filter((o) =>
				normalized.includes(o.value)
			);

			const matchedValues = matched.map((o) => o.value);

			const missing = normalized.filter((v) => !matchedValues.includes(v));

			missing.forEach((value) => {
				const custom = {
					id: dropdownOptions.value.length + 1,
					name: value,
					value,
				};

				dropdownOptions.value.push(custom);

				matched.push(custom);
			});

			selected.value = matched;

			nextTick(() => {
				isSyncingFromParent.value = false;
			});
		},
		{ immediate: true }
	);

	onMounted(() => (isMounted.value = true));

	// ---- Computed for USelectMenu v-model ----
	const labels = computed({
		get: () => selected.value,
		set: (val) => {
			const resolved = val.map((label) => {
				if (label.id) return label;

				// new creatable option
				const custom = {
					id: dropdownOptions.value.length + 1,
					name: label.name,
					value: label.name,
				};
				dropdownOptions.value.push(custom);
				return custom;
			});

			selected.value = resolved;
		},
	});

	// ---- Emit raw values array ----
	watch(selected, (newVal, oldVal) => {
		if (!isMounted.value) return;

		// IMPORTANT
		if (isSyncingFromParent.value) {
			return;
		}

		const newValMap = newVal.map((v) => v.value);

		const oldValMap = oldVal.map((v) => v.value);

		if (arraysEqual(newValMap, oldValMap)) {
			return;
		}

		emit("update:modelValue", newValMap);
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
		v-model="labels"
		by="id"
		name="labels"
		label-key="name"
		:items="dropdownOptions"
		:ui="selectUi"
		:content="uiMenuValue"
		:search-input="true"
		:required="config.required"
		:placeholder="`Search for ${header.name}`"
		multiple
		creatable
		clear-search-on-close>
		<template #item="{ item }">
			<div class="font-normal w-full p-2 rounded-md" :class="item.class">
				<div class="flex gap-1 items-center" :class="optionWrapperClass">
					<span :class="variantStyles.optionClass">{{ item.name }}</span>
					<UIcon v-if="item?.icon" :name="item.icon" class="size-4" />
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
