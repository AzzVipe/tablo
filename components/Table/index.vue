<script setup>
	import * as userConfigStore from "~/stores/config";
	import draggable from "vuedraggable";

	const { tableConfig } = defineProps({
		tableConfig: {
			type: Object,
			required: true,
		},
	});

	const emit = defineEmits(["refreshRecords", "dragChange", "sortData"]);

	const route = useRoute();
	const idToDelete = ref(null);
	const local_headers = ref([...(tableConfig.allHeaders || [])]);
	const selectAllRecords = ref(false);

	const lastSelectedIndex = useState("row-last-selected-index", () => null);
	const configStore = userConfigStore.useStore();

	const store = tableConfig.store();
	const {
		currRecord,
		tableState,
		getCurrentRecordInfo,
		drawer,
		updateModal,
		deleteModal,
	} = tableConfig.currentRecord();
	const { grouped } = tableConfig.groupComposable();
	const { tableTdVisible } = tableConfig.hideComposable();

	const resolvedTableConfig = computed(() => ({
		...tableConfig,
		headers: local_headers.value,
	}));

	onMounted(async () => {
		const rowId = route.query?.rowId;

		if (rowId) {
			try {
				const rowData = await store.findById(rowId);

				if (!rowData) return;

				drawer.value = true;
				getCurrentRecordInfo(rowData);
			} catch (err) {
				console.error("Failed to fetch row:", err);
			}
		}

		lastSelectedIndex.value = null;

		await configStore.fetchUserConfig();
	});

	watch(selectAllRecords, (newVal) => {
		if (newVal) {
			lastSelectedIndex.value = null;

			store.selectedRecords = [
				...new Set(store.recordsData.map((rec) => rec.id)),
			];
		} else {
			store.selectedRecords = [];
		}
	});

	const toggleDrawer = (rowId) => {
		drawer.value = true;

		const query = filterTableState(tableState.value, store.currentPage, {
			rowId,
		});

		navigateTo({
			path: route.path,
			query,
		});
	};

	const handleUpdateRecord = async (event) => {
		if (!event.id || !event.changes) {
			throw new Error("[SideDrawer/Tabs/index] id or changes is missing");
		}

		const { id, changes } = event;

		drawer.value = false;

		const res = await store.updateRecord(id, changes);

		// @TODO: Check if this is needed
		// if (header && header.type === "relation") {
		// 	const path = header.assign_data_path || getPathFromHeader(header);

		// 	const fullObject = getValueByPath(res, path);
		// 	if (fullObject) {
		// 		setValueByPath(data, path, fullObject);
		// 	}
		// }

		// if (header?.type === "multi-relation") {
		// 	const path = header.assign_data_path || getPathFromHeader(header);
		// 	const fullObject = getValueByPath(res, path);

		// 	updateFilterOptions(header, fullObject);
		// }

		emit("refreshRecords");
	};

	//to clear any of the selected data when the drawer is closed
	watch(drawer, (newVal) => {
		if (!newVal && route.query.rowId) {
			currRecord.value = null;

			const query = filterTableState(tableState.value, store.currentPage);

			navigateTo({
				path: route.path,
				query,
			});
		}
	});

	watch(
		tableTdVisible,
		() => {
			if (
				isNullOrUndefinedOrEmpty(tableTdVisible.value) ||
				!tableConfig.headers
			)
				return;

			const ordered = Object.keys(tableTdVisible.value)
				.map((key) => tableConfig.headers.find((h) => h.name === key))
				.filter(Boolean);

			local_headers.value = ordered;
		},
		{ immediate: true }
	);

	const sortHandler = (header) => {
		const path = getPathFromHeader(header);
		const current = tableState.value.sort?.[path] ?? 1;
		const newSort = current === 1 ? -1 : 1;

		emit("sortData", { [path]: newSort });
	};

	const getSortUI = (header) => {
		const path = getPathFromHeader(header);
		const sortState = tableState.value.sort?.[path] ?? 0;

		let tooltip = "No Sorting";

		if (sortState === 1 || sortState === -1) {
			switch (header.type) {
				case "text":
				case "email":
					tooltip = sortState === 1 ? "A → Z" : "Z → A";
					break;
				case "number":
				case "tel":
					tooltip = sortState === 1 ? "Lowest to Highest" : "Highest to Lowest";
					break;
				default:
					tooltip = sortState === 1 ? "Oldest to Newest" : "Newest to Oldest";
			}
		}

		const icon =
			sortState === 1
				? "ic:round-arrow-upward"
				: sortState === -1
				? "ic:round-arrow-downward"
				: "ic:round-swap-vert";

		return { icon, tooltip };
	};

	const tableName = store?.apiPath?.slice?.(1) || "table";

	const defaultWidths = {
		RecordsCellsLinks: 150,
		RecordsCellsDefault: 220,
		RecordsCellsDaysUntil: 250,
		RecordsCellsPeople: 250,
		RecordsCellsMultiValue: 230,
		RecordsCellsDate: 250,
		default: 200,
	};

	const getColumnWidth = (header) => {
		const path = getPathFromHeader(header);
		const storedWidth = configStore.getColumnWidth(tableName, path);

		if (storedWidth) return storedWidth;

		return (
			header.width || defaultWidths[header.component] || defaultWidths.default
		);
	};

	const saveColumnWidth = (name, width) => {
		const numericWidth = parseInt(width);
		if (!numericWidth) return;

		configStore.saveTableColumnWidth(tableName, {
			[name]: numericWidth,
		});
	};
</script>
<template>
	<div class="relative overflow-x-auto rounded-md h-full">
		<component :is="tableConfig.drawerComponent" :tableConfig="tableConfig" />

		<TableModalsUpdate
			:composable="tableConfig.currentRecord"
			:headers="tableConfig.headers"
			@update="handleUpdateRecord($event)" />

		<TableModalsDelete
			:id="`${tableConfig.tableName.plural}-delete-modal`"
			:length="1"
			:composable="tableConfig.currentRecord"
			@delete-record="store.deleteRecord(idToDelete)" />

		<table
			class="table-fixed w-full text-left bg-[var(--table-bg)] text-[var(--text-description)] border-separate border-spacing-y-2">
			<thead
				class="lg:text-base text-sm bg-[var(--table-header)] text-[var(--text-subtitle)] text-nowrap transition-all sticky top-0 z-10 w-full">
				<draggable
					v-model="local_headers"
					item-key="name"
					tag="tr"
					@change="emit('dragChange', $event)">
					<template #header>
						<th scope="col" class="px-3 py-3 w-14">
							<div class="flex items-center">
								<input
									id="checkbox-all-search"
									type="checkbox"
									v-model="selectAllRecords"
									class="h-5 w-5 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent form-checkbox rounded bg-white focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-green-500" />
								<label for="checkbox-all-search" class="sr-only">
									checkbox
								</label>
							</div>
						</th>
						<th scope="col" class="px-3 py-3 w-14">
							<div class="flex items-center gap-1">&nbsp;</div>
						</th>
					</template>

					<template #item="{ element: header, index }">
						<th
							v-if="header.visible && tableTdVisible[header.name]"
							:key="index"
							v-resizable="
								header.resizable !== false && !header.fixed
									? {
											onResize: (newWidth) =>
												saveColumnWidth(getPathFromHeader(header), newWidth),
											minWidth: 150,
											maxWidth: 500,
									  }
									: null
							"
							:style="{ width: getColumnWidth(header) + 'px' }"
							class="px-3 py-3 cursor-pointer"
							:class="[header.fixed ? 'sticky left-0 z-10 bg-white' : '']">
							<div
								class="flex items-center justify-between gap-3 lg:font-semibold font-medium">
								<div class="flex items-center gap-2">
									<span>{{ header.name }}</span>

									<UTooltip
										v-if="header.sort"
										:text="getSortUI(header).tooltip">
										<UButton
											color="gray"
											variant="ghost"
											:trailing-icon="getSortUI(header).icon"
											@click="sortHandler(header)" />
									</UTooltip>
								</div>
							</div>
						</th>
					</template>

					<template #footer>
						<th v-if="tableConfig?.write" scope="col" class="px-3 py-3 w-14">
							<div class="flex items-center gap-1">&nbsp;</div>
						</th>
					</template>
				</draggable>
			</thead>

			<TransitionGroup
				v-if="!grouped.active"
				tag="tbody"
				name="fade"
				class="relative">
				<!-- Skeleton row (conditionally rendered) -->
				<tr
					v-if="store.isAdding"
					class="text-base cursor-pointer bg-[var(--table-skeleton)] max-xl:text-sm min-w-fit">
					<TableRowSkeleton :hideComposable="tableConfig.hideComposable" />
				</tr>

				<!-- Main data rows -->
				<tr
					v-for="(data, index) in store?.recordsData"
					:key="data.id || index"
					class="text-base cursor-pointer max-xl:text-sm min-w-fit group bg-[var(--table-row)] hover:!bg-[var(--table-row-hover)] transition-all"
					:class="{
						'!bg-[var(--table-row-selected)]': currRecord?.id === data?.id,
					}">
					<TableRow
						v-if="data"
						:rowIndex="index"
						:data="data"
						:tableConfig="resolvedTableConfig"
						@update="
							currRecord = data;
							updateModal = true;
						"
						@delete="
							idToDelete = data.id;
							deleteModal = true;
						"
						@refresh-records="emit('refreshRecords')"
						@drawer-open="toggleDrawer($event)" />
				</tr>
			</TransitionGroup>
		</table>
	</div>
</template>

<style scoped>
	.fade-move,
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.5s ease, transform 0.5s ease;
	}
	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
		transform: translateY(-10px);
	}
	.fade-enter-to,
	.fade-leave-from {
		opacity: 1;
		transform: translateY(0);
	}
	.fade-leave-active {
		position: absolute;
	}

	thead tr th:first-child {
		border-radius: 8px 0 0 8px;
	}

	thead tr th:last-child {
		border-radius: 0 8px 8px 0;
	}
</style>
