<script setup>
	const globalStore = useGlobalStore();

	const props = defineProps({
		header: {
			type: Object,
			required: true,
		},
		modelValue: {
			type: [Object, String],
			default: null,
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

	// ---- Store guard ----
	const store = globalStore[props.header.get_from]?.store();

	if (!store) {
		console.warn(
			`[AssignDropdown] Store "${props.header.get_from}" not found in globalStore`
		);
	}

	const path = computed(() => getPathFromHeader(props.header));

	// ---- Fetch using useLazyFetch with custom store function ----
	const {
		data: options,
		status,
		execute,
	} = await useLazyFetch(`assign-dropdown-${path.value}`, {
		key: `${props.config.prefix}-assign-dropdown-${path.value}`,
		transform: (res) => {
			if (!res?.data) return [];

			return res.data.map((opt) => ({
				...opt,
				label: getValueByPath(opt, props.header.get_from_field),
				value: getValueByPath(opt, props.header.get_from_value),
			}));
		},
		$fetch: async () => {
			if (!store) return null;

			const res = await store.findRecords(
				props.header.get_from_match || null,
				props.header.get_from_sort || null,
				{ metadata: true }
			);

			return res;
		},
		immediate: false,
	});

	// ---- Lazy load on open ----
	function onOpen(isOpen) {
		if (isOpen && !options.value?.length) {
			execute();
		}
	}

	// ---- Normalize incoming modelValue to match item shape ----
	const selected = computed({
		get: () => {
			if (isNullOrUndefinedOrEmpty(props.modelValue)) return undefined;

			if (typeof props.modelValue === "object") {
				return (
					options.value?.find(
						(opt) =>
							getValueByPath(opt, props.header.get_from_value) ===
							getValueByPath(props.modelValue, props.header.get_from_value)
					) ?? {
						label: getValueByPath(
							props.modelValue,
							props.header.get_from_field
						),
						value: getValueByPath(
							props.modelValue,
							props.header.get_from_value
						),
					}
				);
			}

			return (
				options.value?.find((opt) => opt.value === props.modelValue) ?? {
					label: props.modelValue,
					value: props.modelValue,
				}
			);
		},
		set: (val) => {
			if (isNullOrUndefinedOrEmpty(val)) {
				emit("update:modelValue", null);
				return;
			}

			const emitValue = props.header?.assign_data_using_object
				? {
						id: val.id,
						[props.header.get_from_value]: val.value,
						[props.header.get_from_field]: val.label,
						[props.header.get_from_image]: val.avatar,
				  }
				: val.value;

			emit("update:modelValue", emitValue);
		},
	});

	const { variantStyles, uiMenuValue, optionWrapperClass } = useDropdownStyles(
		props.config.variant,
		options.value,
		props.header
	);

	const selectUi = computed(() => ({
		item: "!p-1.5 items-center",
		base: variantStyles.value.selectClass,
	}));
</script>

<template>
	<USelectMenu
		v-model="selected"
		by="value"
		:items="options ?? []"
		:loading="status === 'pending'"
		:content="uiMenuValue"
		:ui="selectUi"
		:debounce="300"
		:required="config.required"
		:placeholder="`Search for ${header.name}`"
		:search-input="true"
		:multiple="false"
		clear
		clear-search-on-close
		reset-model-value-on-clear
		@update:open="onOpen">
		<template #leading="{ modelValue }">
			<UAvatar
				v-if="modelValue"
				:src="modelValue.avatar"
				:alt="modelValue.label"
				size="sm" />
		</template>
		<template #item-leading="{ item }">
			<UAvatar v-if="item" :src="item.avatar" :alt="item.label" size="sm" />
		</template>
	</USelectMenu>
</template>
