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
	const store = globalStore[props.header.source]?.useStore();

	if (!store) {
		console.warn(
			`[AssignDropdown] Store "${props.header.source}" not found in globalStore`
		);
	}

	// ---- Local state ----
	const selected = ref(null);
	const query = ref("");
	const isMounted = ref(false);

	const path = computed(() => getPathFromHeader(props.header));

	// ---- Dropdown cache ----
	const dropdownCache = useState(
		`${props.config.prefix}-assign-dropdown-${path.value}`,
		() => ({
			options: [],
			metadata: null,
			isLoading: false,
			lastFetched: null,
		})
	);

	const safeSelected = computed({
		get: () => selected.value ?? undefined,
		set: (val) => {
			selected.value = val ?? null;
		},
	});

	const normalizeFromId = (val) => {
		if (isNullOrUndefinedOrEmpty(val)) return null;

		if (typeof val === "object") {
			return val;
		}

		const temp = dropdownCache.value.options.find(
			(opt) => getValueByPath(opt, props.header.source_value) === val
		);

		return {
			[props.header.source_value]: val,
			[props.header.source_field]: getValueByPath(
				temp,
				props.header.source_field
			),
			[props.header.source_image]: getValueByPath(
				temp,
				props.header.source_image
			),
		};
	};

	// ---- Fetch options ----
	onMounted(async () => {
		if (store && dropdownCache.value.options.length === 0) {
			dropdownCache.value.isLoading = true;

			try {
				const res = await store.findRecords(
					props.header.source_match || null,
					props.header.source_sort || null,
					{ metadata: true }
				);

				if (res) {
					dropdownCache.value.options = res.data;
					dropdownCache.value.metadata = res.metadata;
					dropdownCache.value.lastFetched = new Date();
				}
			} catch (err) {
				console.error("[AssignDropdown] Failed to fetch options:", err);
			} finally {
				dropdownCache.value.isLoading = false;
			}
		}

		isMounted.value = true;
	});

	watch(
		() => props.modelValue,
		(val) => {
			selected.value = normalizeFromId(val);
		},
		{ immediate: true }
	);

	watch(
		() => getValueByPath(selected.value, props.header.source_value),
		(newId) => {
			if (!isMounted.value) return;

			const currentId =
				typeof props.modelValue === "object"
					? getValueByPath(props.modelValue, props.header.source_value)
					: props.modelValue;

			if (newId === currentId) {
				return;
			}

			if (isNullOrUndefinedOrEmpty(newId)) {
				emit("update:modelValue", null);

				return;
			}

			const value = props.header?.assign_data_using_object
				? {
						id: selected.value.id,
						[props.header.source_value]: getValueByPath(
							newVal,
							props.header.source_value
						),
						[props.header.source_field]: getValueByPath(
							newVal,
							props.header.source_field
						),
						[props.header.source_image]: getValueByPath(
							newVal,
							props.header.source_image
						),
				  }
				: newId;

			emit("update:modelValue", value);
		}
	);

	const selectClass = computed(() =>
		props.config.variant === "sm"
			? "input-box-dropdown-sm"
			: "input-box-dropdown"
	);

	const { variantStyles, uiMenuValue } = useDropdownStyles(
		props.config.variant,
		dropdownCache.value?.options,
		props.header
	);
</script>

<template>
	<USelectMenu
		by="id"
		searchable
		v-model="safeSelected"
		v-model:query="query"
		clear-search-on-close
		:ui="{
			size: variantStyles.selectSize,
			icon: { size: variantStyles.iconSize },
		}"
		:loading="dropdownCache.isLoading"
		:debounce="300"
		:multiple="false"
		:trailing="true"
		:options="dropdownCache.options"
		:required="config.required"
		:selectClass="selectClass"
		:uiMenu="uiMenuValue"
		:placeholder="`Search for ${header.name}`"
		:option-attribute="header.source_field">
		<template #label>
			<div :class="variantStyles.labelClass">
				<span v-if="selected" class="truncate">
					{{ getValueByPath(selected, header.source_field) }}
				</span>
				<span v-else class="text-[var(--input-text-placeholder)]">
					Search for {{ header.name }}
				</span>
			</div>
		</template>

		<template #option="{ option: opt }">
			<div
				class="!font-normal w-full rounded-md py-1.5 px-1.5"
				:class="opt.class">
				<div class="flex gap-2 items-center">
					<ImageWrapper
						:src="getValueByPath(opt, header.source_image)"
						:name="getValueByPath(opt, header.source_field)"
						styles="w-7 h-7 rounded-full object-cover text-white text-sm font-medium flex-shrink-0" />
					<span :class="variantStyles.optionClass" class="truncate">
						{{ getValueByPath(opt, header.source_field) }}
					</span>
				</div>
			</div>
		</template>
	</USelectMenu>
</template>
