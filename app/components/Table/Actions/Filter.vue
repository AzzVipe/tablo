<script setup>
	const { data, tableConfig } = defineProps(["data", "tableConfig"]);
	const emit = defineEmits(["filterData"]);

	const isPopoverOpen = ref(false);
	const filters = ref([
		{
			selectHeader: null,
			operator: "",
			operand: "",
		},
	]);

	if (data?.length) {
		filters.value = data;
	} else {
		filters.value = [
			{
				selectHeader: null,
				operator: "",
				operand: "",
			},
		];
	}

	// reset operand when header changes — type determines the default
	const resetOperand = (header) => {
		const config = getOperandConfig({ selectHeader: header, operator: "" });
		if (config?.component === "InputMultiSelectDropdown") return [];
		if (config?.component === "InputChip") return [];
		return "";
	};

	const isFilterOperandEmpty = (filter) => {
		const operand = filter.operand;
		const nullable = filter.selectHeader?.nullable === true;

		if (operand == null) {
			return !nullable;
		}

		if (Array.isArray(operand)) {
			if (nullable && operand.length === 1 && operand[0] === null) {
				return false;
			}

			return operand.every((val) => !val?.toString?.().trim());
		}

		return operand.toString().trim() === "";
	};

	const lastFilter = computed(
		() => filters.value[filters.value.length - 1] || null
	);

	const filterHandler = (closeDropdown) => {
		if (closeDropdown) {
			isPopoverOpen.value = false;
		}

		const filtersValue = filters.value
			.map((el) => {
				const nullable = el.selectHeader?.nullable === true;

				if (el.operator === "range") return { ...el };

				if (Array.isArray(el.operand)) {
					// If [null] and not nullable → mark as invalid (will skip below)
					if (!nullable && el.operand.length === 1 && el.operand[0] === null) {
						return null;
					}

					// Remove nulls if not nullable
					const filteredOperand = !nullable
						? el.operand.filter((val) => val !== null)
						: el.operand;

					return { ...el, operand: filteredOperand };
				}

				let newOperand = el.operand;
				if (
					el?.selectHeader?.type !== "date" &&
					el?.selectHeader?.type !== "number" &&
					(el.operator === "=" || el.operator === "!=")
				) {
					newOperand = el.operand.includes(",")
						? el.operand
								.toString()
								.trim()
								.split(",")
								.map((item) => item.trim())
						: [el.operand];
				}

				return { ...el, operand: newOperand };
			})
			.filter(Boolean);

		if (
			filtersValue.length === 0 ||
			filtersValue.some((value) => value.operator === "") ||
			filtersValue.every(
				(val) =>
					Array.isArray(val.operand) &&
					val.operand.every((v) => v?.toString?.().trim() === "")
			)
		) {
			return;
		}

		emit("filterData", filtersValue);
	};

	const addEmptyFilter = () => {
		if (!lastFilter.value || isFilterOperandEmpty(lastFilter.value)) return;

		filters.value.push({
			selectHeader: null,
			operator: "",
			operand: "",
		});
	};

	const resetHandler = () => {
		const initalValue = [
			{
				selectHeader: null,
				operator: "",
				operand: "",
			},
		];

		isPopoverOpen.value = false;
		filters.value = initalValue;

		emit("filterData", null);
	};

	const deleteFilter = (index) => {
		const [deletedFilter] = filters.value.splice(index, 1);
		if (deletedFilter.operand?.toString()?.trim() !== "") filterHandler();
		if (
			filters.value.length < 2 &&
			(!lastFilter.value || isFilterOperandEmpty(lastFilter.value))
		) {
			resetHandler();
		}
	};

	const getPipelineOptions = (stages) => {
		const temp = stages?.map((item, index) => {
			return { name: item, value: index };
		});

		return temp;
	};

	const OPERATOR_OPTIONS = {
		pipeline: [
			{ label: "is...", value: "=" },
			{ label: "is not...", value: "!=" },
		],
		number: [
			{ label: "is equal to", value: "=" },
			{ label: "is not equal to", value: "!=" },
			{ label: "is less than", value: "<" },
			{ label: "is greater than", value: ">" },
			{ label: "is less than and equals to", value: "<=" },
			{ label: "is greater than and equals to", value: ">=" },
		],
		date: [
			{ label: "range", value: "range" },
			{ label: "is before", value: "<" },
			{ label: "is after", value: ">" },
			{ label: "is before and on", value: "<=" },
			{ label: "is after and on", value: ">=" },
		],
		default: [
			{ label: "is...", value: "=" },
			{ label: "is not...", value: "!=" },
		],
	};

	const getOperatorOptions = (header) => {
		return OPERATOR_OPTIONS[header?.type] ?? OPERATOR_OPTIONS.default;
	};

	const getOperandConfig = (filter) => {
		const header = filter.selectHeader;
		if (!header) return null;

		// has explicit filter_options or is a dropdown type with options
		const hasOptions =
			header.filter_options?.length > 0 ||
			(header.options?.length > 0 &&
				["select", "multi-select"].includes(header.type));

		if (hasOptions) {
			return {
				component: "InputMultiSelectDropdown",
				options: header.filter_options || header.options,
			};
		}

		if (header.type === "pipeline") {
			return {
				component: "InputMultiSelectDropdown",
				options: getPipelineOptions(header.stages),
			};
		}

		if (filter.operator === "range" && header.type === "date") {
			return { component: "InputDateRange" };
		}

		if (header.type === "chips") {
			return { component: "InputChip" };
		}

		if (header.type === "number") {
			return { component: "input-number" };
		}

		return { component: "input-default" };
	};
</script>

<template>
	<ClientOnly>
		<template #fallback>
			<SkeletonDropBtn />
		</template>

		<UPopover v-model:open="isPopoverOpen" :ui="{ base: 'overflow-visible' }">
			<UButton
				color="secondary"
				variant="outline"
				label="Filter"
				icon="ic:round-tune" />

			<template #content>
				<div class="p-3">
					<form
						@submit.prevent="filterHandler(true)"
						class="flex flex-col gap-2">
						<ul
							v-for="(filter, index) in filters"
							:key="index"
							class="flex items-center gap-1 text-sm max-lg:flex-col max-lg:items-start">
							<li>
								<TableActionsSelectMenu
									@change="filter.operand = resetOperand(filter.selectHeader)"
									:options="
										tableConfig.headers.filter((header) => header.filter)
									"
									v-model="filter.selectHeader"
									placeholder="Select a field"
									optAttr="name" />
							</li>

							<li>
								<TableActionsSelectMenu
									:ui="{ base: '!w-28' }"
									:options="getOperatorOptions(filter.selectHeader)"
									v-model="filter.operator"
									placeholder="operator"
									optAttr="label"
									valAttr="value" />
							</li>

							<li class="flex-1">
								<template v-if="filter.selectHeader">
									<FormMultiSelectDropdown
										v-if="
											['InputMultiSelectDropdown'].includes(
												getOperandConfig(filter)?.component
											)
										"
										:key="filter.selectHeader.name"
										:header="filter.selectHeader"
										:modelValue="filter.operand"
										:options="getOperandConfig(filter).options"
										:config="{ variant: 'sm', required: true }"
										@update:modelValue="filter.operand = $event" />

									<FormDateRange
										v-else-if="
											getOperandConfig(filter)?.component === 'InputDateRange'
										"
										:key="filter.operand"
										v-model="filter.operand" />

									<FormChip
										v-else-if="
											getOperandConfig(filter)?.component === 'InputChip'
										"
										:header="filter.selectHeader"
										:fieldValue="filter.operand"
										:autoEdit="false"
										:required="true"
										@change="filter.operand = $event" />

									<input
										v-else-if="
											getOperandConfig(filter)?.component === 'input-number'
										"
										type="number"
										v-model.number="filter.operand"
										:step="filter.selectHeader?.step"
										:maxlength="filter.selectHeader?.max_length"
										:minlength="filter.selectHeader?.min_length"
										class="input-box-sm"
										required />

									<input
										v-else
										:type="filter.selectHeader?.type"
										v-model.trim="filter.operand"
										class="input-box-sm"
										required />
								</template>
							</li>
							<li v-if="filters.length > 1">
								<UButton
									@click="deleteFilter(index)"
									icon="ic:outline-delete-outline"
									color="error"
									variant="ghost"
									class="rounded-full"
									square />
							</li>
						</ul>
						<UButton
							@click="addEmptyFilter()"
							color="secondary"
							variant="ghost"
							label="Add new"
							size="sm"
							icon="ic:round-add-circle"
							class="self-center" />

						<div class="flex justify-center gap-2 w-full max-lg:flex-col">
							<UButton
								type="submit"
								label="Filter"
								size="sm"
								icon="ic:round-tune" />
							<UButton
								@click="resetHandler()"
								color="secondary"
								variant="outline"
								type="reset"
								label="Reset"
								size="sm"
								icon="ic:round-close" />
						</div>
					</form>
				</div>
			</template>
		</UPopover>
	</ClientOnly>
</template>
