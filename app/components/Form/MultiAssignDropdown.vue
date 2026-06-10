<script setup>
	const globalStore = useGlobalStore();

	const props = defineProps({
		header: {
			type: Object,
			required: true,
		},
		modelValue: {
			type: [Array, Object],
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

	// ---- Store guard ----
	const store = globalStore[props.header.get_from]?.store();

	if (!store) {
		console.warn(
			`[MultiAssignDropdown] Store "${props.header.get_from}" not found in globalStore`
		);
	}

	const path = computed(() => getPathFromHeader(props.header));

	// ---- Fetch using useLazyFetch with custom store function ----
	const {
		data: options,
		status,
		execute,
	} = await useLazyFetch(`multi-assign-dropdown-${path.value}`, {
		key: `${props.config.prefix}-multi-assign-dropdown-${path.value}`,
		transform: (res) => {
			if (!res?.data) return [];

			const temp = res.data.map((opt) => ({
				...opt,
				label: getValueByPath(opt, props.header.get_from_field),
				value: getValueByPath(opt, props.header.get_from_value),
				avatar: getValueByPath(opt, props.header.get_from_image),
			}));
			console.log(temp);
			return temp;
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
			if (!props.modelValue?.length) return [];

			const normalize = (fv) => {
				if (typeof fv === "object") {
					return (
						options.value?.find(
							(opt) =>
								opt.value === getValueByPath(fv, props.header.get_from_value)
						) ?? {
							label: getValueByPath(fv, props.header.get_from_field),
							value: getValueByPath(fv, props.header.get_from_value),
							avatar: getValueByPath(fv, props.header.get_from_image),
						}
					);
				}

				return (
					options.value?.find((opt) => opt.value === fv) ?? {
						label: fv,
						value: fv,
					}
				);
			};

			const arr = Array.isArray(props.modelValue)
				? props.modelValue
				: [props.modelValue];

			return arr.map(normalize).filter(Boolean);
		},
		set: (val) => {
			if (!val?.length) {
				emit("update:modelValue", []);
				return;
			}

			const emitValue = props.header?.assign_data_using_object
				? val.map((item) => ({
						id: item.id,
						[props.header.get_from_value]: item.value,
						[props.header.get_from_field]: item.label,
						[props.header.get_from_image]: item.avatar,
				  }))
				: val.map((item) => item.value);

			emit("update:modelValue", emitValue);
		},
	});

	const { variantStyles, uiMenuValue } = useDropdownStyles(
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
		multiple
		clear
		clear-search-on-close
		@update:open="onOpen">
		<template #item-leading="{ item }">
			<UAvatar v-if="item" :src="item.avatar" :alt="item.label" size="sm" />
		</template>
	</USelectMenu>
</template>
