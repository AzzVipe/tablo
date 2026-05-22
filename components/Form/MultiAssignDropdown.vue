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

	// ---- Store ----
	const store = globalStore[props.header.get_from]?.useStore();

	if (!store) {
		console.warn(
			`[MultiAssignDropdown] Store "${props.header.get_from}" not found in globalStore`
		);
	}

	// ---- Local state ----
	const selected = ref([]);
	const query = ref("");
	const isMounted = ref(false);

	const path = computed(() => getPathFromHeader(props.header));

	// ---- Dropdown cache (shared across rows via useState) ----
	const dropdownCache = useState(
		`${props.config.prefix}-multi-assign-dropdown-${path.value}`,
		() => ({
			options: [],
			metadata: null,
			isLoading: false,
			lastFetched: null,
		})
	);

	// flag to prevent circular updates
	const isUpdatingFromParent = ref(false);

	// convert array of ids → array of objects using cache
	const normalizeFromIds = (val) => {
		if (!val?.length) return [];

		// Already full objects — just map to selected shape directly
		if (typeof val[0] === "object") {
			return val.map((fv) => ({
				id: getValueByPath(fv, props.header.get_from_value),
				[props.header.get_from_field]: getValueByPath(
					fv,
					props.header.get_from_field
				),
				[props.header.get_from_image]: getValueByPath(
					fv,
					props.header.get_from_image
				),
			}));
		}

		// Array of ids — look up from cache
		return val
			.map((id) =>
				dropdownCache.value.options.find(
					(opt) => getValueByPath(opt, props.header.get_from_value) === id
				)
			)
			.filter(Boolean)
			.map((fv) => ({
				id: getValueByPath(fv, props.header.get_from_value),
				[props.header.get_from_field]: getValueByPath(
					fv,
					props.header.get_from_field
				),
				[props.header.get_from_image]: getValueByPath(
					fv,
					props.header.get_from_image
				),
			}));
	};

	const selectedIds = computed(() =>
		selected.value.map((item) =>
			getValueByPath(item, props.header.get_from_value)
		)
	);

	watch(
		() => props.modelValue,
		(val) => {
			isUpdatingFromParent.value = true;

			selected.value = normalizeFromIds(val);

			nextTick(() => {
				isUpdatingFromParent.value = false;
			});
		},
		{ immediate: true }
	);

	// selected → parent (skip if triggered by parent update)
	watch(selectedIds, (newIds, oldIds) => {
		if (!isMounted.value) return;

		if (isUpdatingFromParent.value) {
			return;
		}

		if (arraysEqual(newIds, oldIds)) {
			return;
		}

		const value = props.header?.assign_data_using_object
			? selected.value.map((item) => ({
					id: item.id,
					[props.header.get_from_value]: getValueByPath(
						item,
						props.header.get_from_value
					),
					[props.header.get_from_field]: getValueByPath(
						item,
						props.header.get_from_field
					),
					[props.header.get_from_image]: getValueByPath(
						item,
						props.header.get_from_image
					),
			  }))
			: newIds;

		emit("update:modelValue", value);
	});

	// ---- Fetch options if cache is empty ----
	onMounted(async () => {
		if (store && dropdownCache.value.options.length === 0) {
			dropdownCache.value.isLoading = true;

			try {
				const res = await store.findRecords(
					props.header.get_from_match || null,
					props.header.get_from_sort || null,
					{ metadata: true }
				);

				if (res) {
					dropdownCache.value.options = res.data;
					dropdownCache.value.metadata = res.metadata;
					dropdownCache.value.lastFetched = new Date();
				}
			} catch (err) {
				console.error("[MultiAssignDropdown] Failed to fetch options:", err);
			} finally {
				dropdownCache.value.isLoading = false;
			}
		}

		isMounted.value = true;
	});

	// ---- Styles ----
	const selectClass = computed(() =>
		props.config.variant === "sm"
			? "input-box-dropdown-sm"
			: "input-box-dropdown"
	);

	const { variantStyles, uiMenuValue, optionWrapperClass } = useDropdownStyles(
		props.config.variant,
		dropdownCache.value?.options,
		props.header
	);
</script>

<template>
	<USelectMenu
		by="id"
		multiple
		searchable
		clear-search-on-close
		v-model="selected"
		v-model:query="query"
		:ui="{
			size: variantStyles.selectSize,
			icon: { size: variantStyles.iconSize },
		}"
		:loading="dropdownCache.isLoading"
		:debounce="300"
		:trailing="true"
		:options="dropdownCache.options"
		:required="props.config.required"
		:selectClass="selectClass"
		:uiMenu="uiMenuValue"
		:placeholder="`Search for ${header.name}`"
		:option-attribute="header.get_from_field">
		<template #label>
			<div :class="variantStyles.labelClass">
				<span v-if="selected.length" class="truncate">
					{{
						selected
							.map((item) => getValueByPath(item, header.get_from_field))
							.join(", ")
					}}
				</span>
				<span v-else class="text-[var(--input-text-placeholder)]">
					Select {{ header.name }}
				</span>
			</div>
		</template>

		<template #option="{ option: opt }">
			<div
				class="!font-normal w-full rounded-md py-1.5 px-1.5"
				:class="opt.class">
				<div class="flex gap-2 items-center" :class="optionWrapperClass">
					<ImageWrapper
						:src="getValueByPath(opt, header.get_from_image)"
						:name="getValueByPath(opt, header.get_from_field)"
						styles="w-7 h-7 rounded-full object-cover text-white text-sm font-medium flex-shrink-0" />
					<span :class="variantStyles.optionClass" class="truncate">
						{{ getValueByPath(opt, header.get_from_field) }}
					</span>
				</div>
			</div>
		</template>
	</USelectMenu>
</template>
