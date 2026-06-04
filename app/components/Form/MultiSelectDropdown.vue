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
		v-model="labels"
		by="id"
		name="labels"
		:options="dropdownOptions"
		option-attribute="name"
		multiple
		searchable
		creatable
		:required="config.required">
		<template #label>
			<div :class="variantStyles.labelClass">
				<template v-if="labels.length">
					<span class="ml-3 truncate w-fit">
						{{ labels.map((l) => l.name).join(", ") }}
					</span>
				</template>
				<template v-else>
					<span class="text-[var(--input-text-placeholder)]">
						Select {{ header.name }}
					</span>
				</template>
			</div>
		</template>

		<template #option="{ option }">
			<div
				class="!font-normal w-full rounded-md py-1.5 px-1.5"
				:class="option.class"
				:style="getOptionColor(option, header)">
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
