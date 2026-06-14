<script setup>
	const { currentUser } = useAuth();

	const { tableConfig, TABLE_DATA } = defineProps([
		"tableConfig",
		"TABLE_DATA",
	]);

	const store = tableConfig.store();
	const selectedRecords = store.selectedRecords;

	const emit = defineEmits(["updateRecords"]);

	const isPopoverOpen = ref(false);

	const selectedValue = ref({
		header: "Select a field",
		value: null,
	});

	const resetHandler = () => {
		isPopoverOpen.value = false;
	};

	const updateHandler = () => {
		const header = selectedValue.value.header;

		if (isNullOrUndefinedOrEmpty(header)) return;

		const path = header.assign_data_path || getPathFromHeader(header);

		const set_data = {};

		if (selectedValue.value.header?.type === "pipeline") {
			const value = +selectedValue.value.value; // new stage index
			const stagesArray = header.stages || [];

			const currentPipeline = stagesArray.map((name, index) => ({
				name,
				date: index === value ? new Date() : null,
				description: "",
				comment: "",
			}));

			set_data[path] = {
				pipeline: currentPipeline,
				currentStage: value,
			};
		} else if (selectedValue.value.header?.type === "date") {
			const value = selectedValue.value.value;
			set_data[path] = new Date(value);
		} else {
			const value = selectedValue.value.value;
			set_data[path] = value;
		}

		emit("updateRecords", { set_data, header });

		selectedValue.value = {
			header: null,
			value: "",
		};

		resetHandler();
	};

	watch(
		() => selectedValue.value.header,
		(newHeader) => {
			selectedValue.value.value = ""; // reset just the value
			if (!newHeader) {
				selectedValue.value = { header: "Select a field", value: null };
			}
		}
	);
</script>

<template>
	<ClientOnly>
		<UPopover v-model:open="isPopoverOpen" :ui="{ base: 'overflow-visible' }">
			<UButton
				color="secondary"
				variant="outline"
				label="Update selected"
				icon="ic:outline-edit" />

			<template #content>
				<div class="grid grid-cols-1 gap-4 p-3">
					<ul
						class="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-3 items-center gap-2 text-sm max-lg:flex-col max-lg:items-start">
						<li class="flex flex-col gap-2 max-sm:gap-1">
							<label class="max-sm:ml-0.5">Fields:</label>
							<TableActionsSelectMenu
								:ui="{ base: '!w-full' }"
								:options="
									tableConfig.headers.filter(
										(header) => header.update_many === true
									)
								"
								v-model="selectedValue.header"
								placeholder="Select a field"
								optAttr="name" />
						</li>

						<li class="flex flex-col gap-2 max-sm:gap-1">
							<label
								v-if="
									selectedValue.header &&
									selectedValue.header !== 'Select a field'
								"
								class="max-sm:ml-0.5">
								Value:
							</label>

							<FormSingleSelectDropdown
								v-if="
									selectedValue.header?.type === 'select' &&
									selectedValue.header?.options?.length > 0
								"
								@change="(val) => (selectedValue.value = val)"
								:header="{
									name: 'field',
									options: selectedValue.header.options,
									optionsParentClass:
										selectedValue.header.optionsParentClass || '',
								}"
								:fieldValue="selectedValue.value"
								:required="true"
								variant="sm" />

							<FormMultiAssignDropdown
								v-else-if="selectedValue?.header?.type === 'multi-relation'"
								v-model="selectedValue.value"
								:header="header"
								:options="{
									prefix: 'update-selected',
									variant: 'sm',
								}" />
							<!-- <FormMultiAssignDropdown
								v-else-if="selectedValue?.header?.type === 'multi-relation'"
								@change="(val) => (selectedValue.value = val)"
								:header="selectedValue?.header"
								:fieldValue="selectedValue?.value"
								prefix="update-selected"
								variant="sm" /> -->

							<FormAssignDropdown
								v-else-if="selectedValue?.header?.type === 'relation'"
								@change="(val) => (selectedValue.value = val)"
								:header="selectedValue?.header"
								:fieldValue="selectedValue?.value"
								prefix="update-selected"
								variant="sm" />

							<FormMultiSelectDropdown
								v-else-if="selectedValue.header?.type === 'multi-select'"
								@change="(val) => (selectedValue.value = val)"
								:header="{
									name: 'field',
									options: selectedValue.header.options,
									optionsParentClass:
										selectedValue.header.optionsParentClass || '',
								}"
								:fieldValue="selectedValue.value"
								:required="true"
								variant="sm" />

							<input
								v-else-if="
									selectedValue.header?.type === 'text' ||
									selectedValue.header?.type === 'email'
								"
								:type="selectedValue.header?.type"
								v-model="selectedValue.value"
								class="input-box-sm"
								required />

							<input
								v-else-if="
									selectedValue.header?.type === 'tel' ||
									selectedValue.header?.type === 'number'
								"
								:type="selectedValue.header?.type"
								v-model="selectedValue.value"
								class="input-box-sm"
								required />

							<input
								v-else-if="selectedValue.header?.type === 'date'"
								:type="selectedValue.header?.type"
								v-model="selectedValue.value"
								class="input-box-sm"
								required />

							<FormChip
								v-if="selectedValue.header?.type === 'chips'"
								@change="(val) => (selectedValue.value = val)"
								:header="selectedValue.header"
								:key="selectedValue.header"
								required
								:autoEdit="false" />

							<FormSingleSelectDropdown
								v-if="selectedValue.header?.type === 'pipeline'"
								@change="(val) => (selectedValue.value = val)"
								:header="{
									name: 'Stage',
									options: selectedValue.header.stages.map((stage, index) => ({
										name: stage,
										value: index,
									})),
									stages: selectedValue.header.stages,
									colors: selectedValue.header.colors || [],
								}"
								:fieldValue="selectedValue.value"
								:required="true"
								variant="sm" />
						</li>
					</ul>
					<div class="flex justify-center gap-2 w-full">
						<UButton
							@click="updateHandler()"
							label="Update"
							icon="ic:baseline-check"
							size="sm" />
						<UButton
							@click="resetHandler()"
							label="Cancel"
							color="secondary"
							variant="outline"
							icon="ic:round-close"
							size="sm" />
					</div>
				</div>
			</template>
		</UPopover>
	</ClientOnly>
</template>
