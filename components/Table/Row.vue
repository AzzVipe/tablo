<script setup>
	const {
		rowIndex,
		data: rowData,
		tableConfig,
	} = defineProps(["rowIndex", "data", "tableConfig"]);

	const emit = defineEmits([
		"update",
		"delete",
		"drawerOpen",
		"refreshRecords",
	]);

	const { enqueue, flush } = useUpdateQueue(300);

	const isEditCanceled = ref(false);

	const store = tableConfig.store();
	const isRecordSelected = ref(false);

	const rowDataCopy = ref(null);
	const lastSelectedIndex = useState("row-last-selected-index");
	const rowColumnIndex = useState("row-column-index", () => null);

	const { tableTdVisible } = tableConfig.hideComposable();
	const { getCurrentRecordInfo } = tableConfig.currentRecord();

	watch(
		() => rowData,
		(newVal) => {
			rowDataCopy.value = JSON.parse(JSON.stringify(newVal));
		},
		{ immediate: true }
	);

	watch(isRecordSelected, (newData, oldData) => {
		if (newData === true) store.selectRecord(rowData.id);
		else store.unselectRecord(rowData.id);
	});

	onBeforeUnmount(() => {
		flush();
	});

	const detailsHandler = (rowData) => {
		flush();
		getCurrentRecordInfo(rowData);
		emit("drawerOpen", rowData.id);
	};

	const hasUpdate = computed(() => {
		return tableConfig.headers.some((field) => field.editable);
	});

	const handleRowColumnClick = (index, header) => {
		flush();
		isEditCanceled.value = false;
		rowColumnIndex.value = index;
	};

	const handleColumnEscape = () => {
		isEditCanceled.value = true;
		flush();

		rowDataCopy.value = JSON.parse(JSON.stringify(rowData));
		rowColumnIndex.value = null;
	};

	const shouldQueueUpdate = (header) => {
		return ["multi-select", "multi-relation"].includes(header.type);
	};

	const handleColumnUpdate = (changes, header) => {
		if (isEditCanceled.value) {
			isEditCanceled.value = false;
			return;
		}

		const fieldNames = Object.keys(changes);
		if (!fieldNames.length) return;

		const path = header.assign_data_path || getPathFromHeader(header);

		const runUpdate = async () => {
			console.log("running update", changes);
			const res = await store.updateRecord(rowData.id, changes);

			if (res) {
				for (const key in changes) {
					let value = changes[key];

					if (["relation", "multi-relation"].includes(header.type)) {
						const fullObject = getValueByPath(res, path);
						if (fullObject) value = fullObject;
						updateFilterOptions(header, fullObject);
					}

					setValueByPath(rowData, key, value);
					setValueByPath(rowDataCopy.value, key, value);
				}
			}
		};

		if (shouldQueueUpdate(header)) {
			console.log("enqueing update");
			enqueue({
				key: `${rowData.id}:${path}`,
				run: runUpdate,
			});
		} else {
			// immediate update (text, date, etc.)
			runUpdate();
			handleColumnEscape();
		}
	};

	const columnUpdateHandler = async (changes) => {
		if (isNullOrUndefinedOrEmpty(changes)) return;

		const res = await store.updateRecord(rowData.id, changes);
	};

	const handleCheckboxClick = (id, event) => {
		// Range select/deselect
		if (event.shiftKey && lastSelectedIndex.value !== null) {
			const start = Math.min(lastSelectedIndex.value, rowIndex);
			const end = Math.max(lastSelectedIndex.value, rowIndex);

			const idsInRange = store.recordsData
				.slice(start, end + 1)
				.map((r) => r.id);

			const isRangeFullySelected = idsInRange.every((id) =>
				store.selectedRecords.includes(id)
			);

			if (isRangeFullySelected) {
				// RANGE DESELECT
				store.selectedRecords = store.selectedRecords.filter(
					(id) => !idsInRange.includes(id)
				);
			} else {
				// RANGE SELECT
				store.selectedRecords = Array.from(
					new Set([...store.selectedRecords, ...idsInRange])
				);
			}

			return;
		}

		// Normal toggle click
		if (store.selectedRecords.includes(id)) {
			store.selectedRecords = store.selectedRecords.filter(
				(selectedId) => selectedId !== id
			);
		} else {
			store.selectedRecords = [...store.selectedRecords, id];
		}

		// Update anchor for future SHIFT clicks
		lastSelectedIndex.value = rowIndex;
	};

	const tableName = store?.apiPath.slice(1);
</script>

<template>
	<td class="w-12 transition-all rounded-l-lg" scope="row">
		<div class="flex items-center pl-3">
			<input
				@mousedown.prevent
				@click="handleCheckboxClick(rowData.id, $event)"
				:id="`checkbox-table-${rowData.id}`"
				:checked="store.selectedRecords.includes(rowData.id)"
				type="checkbox"
				class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent form-checkbox rounded bg-white focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-green-500" />
			<label :for="`checkbox-table-${rowData.id}`" class="sr-only">
				checkbox
			</label>
		</div>
	</td>

	<td class="w-12 transition-all mx-auto" scope="row">
		<UButton
			@click="detailsHandler(rowData)"
			title="Open drawer"
			icon="ic:round-open-in-new"
			class="mx-2 rounded-full"
			size="sm"
			color="gray"
			variant="ghost" />
	</td>

	<template v-for="(header, index) in tableConfig.headers" :key="index">
		<td
			v-if="rowColumnIndex === `${rowData.id}-${index}` && header.editable"
			v-click-outside="handleColumnEscape"
			class="px-1 py-1.5">
			<form @submit.prevent autocomplete="off">
				<FormFields
					@update="handleColumnUpdate($event, header)"
					@keydown.esc="handleColumnEscape"
					:data="rowDataCopy"
					:header="header"
					:config="{
						hideLabel: true,
						operationType: 'update',
						chipAutoEdit: false,
					}" />
			</form>
		</td>

		<template v-else>
			<td
				v-if="header.visible && tableTdVisible?.[header.name]"
				@dblclick="handleRowColumnClick(`${rowData.id}-${index}`, header)"
				class="button-open whitespace-nowrap px-3 py-1.5 transition-all bg-clip-padding">
				<template v-if="header.component">
					<component
						@update-column="columnUpdateHandler($event)"
						:index="index"
						:header="header"
						:is="header?.component"
						:tableName="tableName"
						:recordId="rowData.id"
						:image="getValueByPath(rowData, header.image_path)"
						:content="
							header?.use_row_data
								? rowData
								: getValueByPath(rowData, getPathFromHeader(header))
						" />
				</template>
				<template v-else>
					<TableCellsDefault
						@update-column="columnUpdateHandler($event)"
						:index="index"
						:header="header"
						:recordId="rowData.id"
						:content="getValueByPath(rowData, getPathFromHeader(header))" />
				</template>
			</td>
		</template>
	</template>

	<template v-for="(tab, index) in tableConfig.tab_headers" :key="index">
		<template v-for="(header, index) in tab?.headers" :key="index">
			<td
				v-if="header.visible && tableTdVisible?.[header.name]"
				class="button-open whitespace-nowrap"
				@click="detailsHandler(rowData)">
				<TableCellsDefault
					:index="index"
					:header="header"
					:recordId="rowData.id"
					:content="getValueByPath(rowData, getPathFromHeader(header))" />
			</td>
		</template>
		<td
			v-if="
				tab.header?.visible === true &&
				tab.header?.table_view === true &&
				tableTdVisible?.[tab.header.name]
			"
			class="button-open whitespace-nowrap"
			@click="detailsHandler(rowData)">
			<TableCellsDefault
				:index="index"
				:header="header"
				:recordId="rowData.id"
				:content="getValueByPath(rowData, getPathFromHeader(header))" />
		</td>
	</template>

	<td v-if="tableConfig.write === true" class="p-2 w-12 transition-all">
		<div class="flex items-center justify-center">
			<TableMenu
				@update="emit('update')"
				@delete="emit('delete')"
				:id="rowData.id"
				:tableName="tableConfig.tableName.plural"
				:hasUpdate="hasUpdate"
				:hasDelete="tableConfig?.user_role?.delete" />
		</div>
	</td>
</template>

<style scoped>
	tbody td {
		background: var(--table-row);
	}

	tbody tr:hover td {
		background: var(--table-row-hover);
	}

	tbody tr td:first-child {
		border-radius: 8px 0 0 8px;
	}

	tbody tr td:last-child {
		border-radius: 0 8px 8px 0;
	}
</style>
