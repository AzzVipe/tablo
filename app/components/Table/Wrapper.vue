<script setup>
	const props = defineProps({
		tableConfig: {
			type: Object,
			required: true,
		},
		roles: {
			type: Array,
			default: () => [],
		},
	});

	const tableConfig = props.tableConfig;
	const roles = props.roles;

	// -----------------------------------
	// VALIDATION
	// -----------------------------------

	if (!tableConfig) {
		throw new Error("[TableWrapper] tableConfig is required");
	}

	if (typeof tableConfig.store !== "function") {
		throw new Error("[TableWrapper] tableConfig.store must be function");
	}

	// -----------------------------------
	// CORE
	// -----------------------------------

	const store = tableConfig.store();

	if (!store) {
		throw new Error("[TableWrapper] Failed to initialize store");
	}

	const route = useRoute();

	const globalStore = useGlobalStore();

	const { currentUser } = useAuth();

	const { currentPageConfig } = usePages();

	const tableStateStore = useTableStateStore();

	const { bucket, tableState, activeTableState } = tableConfig.currentRecord();

	const { tableTdVisible } = tableConfig.hideComposable();

	// -----------------------------------
	// STATE
	// -----------------------------------

	const tableKey = ref(0);

	const kanbanView = ref(false);

	const searchValue = ref("");

	const userRole = ref(null);

	const searchableHeaders = ref([]);

	store.isFetching = true;

	// -----------------------------------
	// SAFE INIT
	// -----------------------------------

	if (!(bucket.value instanceof Map)) {
		bucket.value = new Map();
	}

	// -----------------------------------
	// HELPERS
	// -----------------------------------

	const refreshRecordsHandle = () => {
		tableKey.value++;
	};

	const parseTableStateQuery = (value) => {
		if (!value || typeof value !== "string") {
			return null;
		}

		try {
			return JSON.parse(value);
		} catch (err) {
			console.error("[TableWrapper] Invalid tablestate query", err);

			return null;
		}
	};

	const updateRouteQuery = (query) => {
		navigateTo({
			path: route.path,
			query,
		});
	};

	const isTableStateEmpty = (view) => {
		if (!view) return true;

		return !view.sort && !view.match && !view.filters;
	};

	// -----------------------------------
	// COMPUTED
	// -----------------------------------

	const activeSort = computed(() => {
		return tableState.value?.sort || tableConfig.defaultSort;
	});

	const tableName = computed(() => {
		const singular = tableConfig?.tableName?.singular || "Record";

		const plural = tableConfig?.tableName?.plural || "Records";

		return store.recordsDataLength <= 1 ? singular : plural;
	});

	const paginationKey = computed(() => {
		return `${store.totalPages}-${store.currentPage}-${tableKey.value}`;
	});

	const searchablePlaceholder = computed(() => {
		const uniqueNames = new Set(
			searchableHeaders.value.map((item) => item.name)
		);

		return Array.from(uniqueNames).join(", ");
	});

	// -----------------------------------
	// TABLESTATE INIT
	// -----------------------------------

	const routeTableState = parseTableStateQuery(route.query?.tablestate);

	if (routeTableState) {
		tableState.value = routeTableState;
	} else if (!isTableStateEmpty(tableState.value)) {
		const query = filterTableState(tableState.value, store.currentPage);

		if (route.query.rowId) {
			query.rowId = route.query.rowId;
		}

		updateRouteQuery(query);
	}

	if (tableState.value?.id) {
		try {
			activeTableState.value = await tableStateStore.fetchView(
				tableState.value.id
			);
		} catch (err) {
			console.error(err);
		}
	}

	if (tableState.value?.match) {
		tableState.value.filters = prepareFilterFromMatch(
			tableState.value.match,
			tableConfig.headers
		);
	}

	// -----------------------------------
	// PAGE VALIDATION
	// -----------------------------------

	const pageQuery = Number(route.query?.page);

	if (!route.query?.page) {
		updateRouteQuery({
			page: store.currentPage,
		});
	} else if (Number.isNaN(pageQuery) || pageQuery <= 0) {
		updateRouteQuery({
			page: 1,
		});
	}

	// -----------------------------------
	// HEADER INIT
	// -----------------------------------

	const initializeHeaders = async () => {
		for (const item of tableConfig.headers || []) {
			const field = getPathFromHeader(item);

			// UNIQUE FILTER VALUES
			if (
				item.unique_values &&
				typeof store.fetchUniqueFieldValues === "function"
			) {
				try {
					const res = await store.fetchUniqueFieldValues(item.unique_values);

					if (Array.isArray(res)) {
						item.filter_options = res.map((value) => ({
							name: value,
							value,
						}));
					} else if (res && typeof res === "object") {
						item.filter_options = Object.entries(res).map(([value, name]) => ({
							name,
							value,
						}));
					}
				} catch (err) {
					console.error(err);
				}
			}

			// SEARCHABLE HEADERS
			if (item.searchable) {
				searchableHeaders.value.push({
					name: item.name,
					path: field,
				});
			}

			// PRIMARY HEADER
			if (item.is_primary) {
				tableConfig.primaryHeader = item;

				if (item.searchable !== false) {
					searchableHeaders.value.push({
						name: item.name,
						path: field,
					});
				}

				const direction = item.primary_sort_type ?? 1;

				tableConfig.setDefaultSort(field, direction);

				if (!tableState.value?.sort) {
					tableState.value.sort = tableConfig.defaultSort;
				}
			}
		}
	};

	// -----------------------------------
	// ROLE INIT
	// -----------------------------------

	const initializeUserRole = () => {
		if (tableConfig.userRole) {
			return tableConfig.userRole;
		}

		const role = roles.find(
			(item) =>
				item.name?.toLowerCase?.() === currentUser.value?.role?.toLowerCase?.()
		);

		tableConfig.setUserRole(role || null);

		return tableConfig.userRole;
	};

	// -----------------------------------
	// TABLE INIT
	// -----------------------------------

	onBeforeMount(async () => {
		try {
			userRole.value = initializeUserRole();

			await initializeHeaders();

			store.pageCache = {};

			await store.fetchData(
				tableState.value?.match,
				activeSort.value,
				pageQuery || 1
			);

			setTableRules(tableConfig, roles);

			if (tableState.value?.hide) {
				tableTdVisible.value = tableState.value.hide;
			} else if (isNullOrUndefinedOrEmpty(tableTdVisible.value)) {
				const { tdInit } = tableConfig.hideComposable();

				tdInit(tableConfig.headers, tableConfig.tab_headers);
			}
		} catch (err) {
			console.error(err);
		} finally {
			store.isFetching = false;
		}
	});

	// -----------------------------------
	// PAGINATION
	// -----------------------------------

	const navigateToPage = async (page) => {
		console.log(page);
		await store.fetchData(tableState.value?.match, activeSort.value, page);

		updateRouteQuery(filterTableState(tableState.value, page));
	};

	const fetchNewPage = async (page) => {
		store.currentPage = page;

		await store.fetchData(tableState.value?.match, activeSort.value);

		updateRouteQuery(filterTableState(tableState.value, page));
	};

	// -----------------------------------
	// RECORD HANDLERS
	// -----------------------------------

	const addRecordHandler = async (data) => {
		try {
			await store.addRecord(data.data, data.assign_files, globalStore);

			refreshRecordsHandle();
		} catch (err) {
			console.error(err);
		}
	};

	const bulkUpdateHandler = async (event) => {
		try {
			const { set_data, header } = event;

			const res = await store.updateRecordsMany(set_data, tableState.value);

			const fullObject = res.flatMap((item) => item.assignedTo || []);

			updateFilterOptions(header, fullObject);
		} catch (err) {
			console.error(err);
		}
	};

	// -----------------------------------
	// SEARCH
	// -----------------------------------

	const debounce = (func, delay) => {
		let timer;

		return (...args) => {
			clearTimeout(timer);

			timer = setTimeout(() => {
				func(...args);
			}, delay);
		};
	};

	const debouncedSearch = debounce(async (newVal) => {
		try {
			store.currentPage = 1;

			if (!newVal?.trim()) {
				await store.fetchData(tableState.value?.match, activeSort.value);
			} else {
				await store.searchData(newVal, activeSort.value);
			}

			refreshRecordsHandle();
		} catch (err) {
			console.error(err);
		}
	}, 300);

	watch(searchValue, (newVal, oldVal) => {
		if (newVal !== oldVal) {
			debouncedSearch(newVal);
		}
	});

	// -----------------------------------
	// COLUMN REORDER
	// -----------------------------------

	const reorderTableTdVisible = (event) => {
		if (!event?.moved || isNullOrUndefinedOrEmpty(tableTdVisible.value)) {
			return;
		}

		const { oldIndex, newIndex } = event.moved;

		const entries = Object.entries(tableTdVisible.value);

		const [moved] = entries.splice(oldIndex, 1);

		entries.splice(newIndex, 0, moved);

		tableTdVisible.value = Object.fromEntries(entries);
	};

	// -----------------------------------
	// TEMPLATE HELPERS
	// -----------------------------------

	const handleSortData = (event) => {
		sortHandler(event, tableConfig, fetchNewPage);
	};
</script>

<template>
	<div>
		<div class="flex flex-col h-screen p-2 pb-0">
			<header class="text-[var(--text-title)]">
				<div
					class="flex items-center justify-between max-xl:flex-col max-xl:items-start gap-4 animate-fade-in">
					<div
						class="flex xl:w-fit w-full items-center max-sm:justify-between sm:gap-8 gap-4 lg:pl-4 pl-16">
						<div class="flex gap-4 text-nowrap">
							<h2 class="text-2xl font-bold text-[var(--text-subtitle)]">
								{{ store.recordsDataLength }}
							</h2>
							<div class="flex gap-2 items-center justify-center">
								<ClientOnly>
									<UIcon
										v-if="currentPageConfig?.icon"
										:name="currentPageConfig?.icon"
										class="size-6 transition-all duration-300" />
								</ClientOnly>
								<h2 class="text-xl max-sm:hidden sm:inline font-bold">
									{{ tableName }}
								</h2>
							</div>
						</div>

						<div class="flex sm:gap-4 gap-2">
							<!-- HIDE Dropdown -->
							<TableActionsHide
								:tabHeaders="tableConfig.tab_headers"
								:headers="tableConfig.headers"
								:hideComposable="tableConfig.hideComposable" />

							<!-- SORT Dropdown -->
							<TableActionsSort
								:key="tableState?.sort"
								:data="tableState?.sort"
								:tableConfig="tableConfig"
								@sort-data="sortHandler($event, tableConfig, fetchNewPage)" />

							<!-- FILTER Dropdown -->
							<TableActionsFilter
								:key="tableState?.filters"
								:data="tableState?.filters"
								:tableConfig="tableConfig"
								@filter-data="
									filterHandler($event, tableConfig, fetchNewPage)
								" />

							<ClientOnly>
								<TableModalsAdd
									v-if="!kanbanView && userRole?.insert"
									modalId="AddRecord"
									:useStore="tableConfig.store"
									:headers="tableConfig.headers"
									:label="tableConfig.tableName.singular"
									@add-record="addRecordHandler($event)" />
							</ClientOnly>
						</div>
					</div>

					<div class="flex items-center sm:gap-4 gap-2 w-full h-fit">
						<!-- Options visible when record is selected -->
						<div v-if="store.selectedRecords?.length > 0" class="flex gap-4">
							<!-- BULK-UPDATE Dropdown -->
							<TableActionsUpdateSelected
								:key="store.selectedRecords"
								:tableConfig="tableConfig"
								@update-records="bulkUpdateHandler($event)" />

							<!-- BULK-DELETE Dropdown -->
							<TableActionsDeleteSelected
								v-if="userRole?.delete"
								@delete-selected="store.deleteRecordsMany(tableState)"
								:length="store.selectedRecords.length" />
						</div>
						<div
							class="flex items-center justify-end sm:gap-4 gap-2 w-full h-fit">
							<div class="flex items-center sm:gap-4 gap-2">
								<TableModalsTableState
									:refreshRecordsHandle="refreshRecordsHandle"
									:tableConfig="tableConfig" />
							</div>
							<div
								class="flex items-center md:max-w-[400px] w-full xl:pr-2 self-end">
								<label
									for="record-search"
									class="mb-2 text-sm font-medium text-gray-900 sr-only">
									Search
								</label>
								<div class="relative w-full">
									<div
										class="absolute inset-y-0 left-1 flex items-center pl-3 pointer-events-none">
										<UIcon
											name="ic:round-search"
											class="w-6 h-6 text-gray-400" />
									</div>
									<input
										v-model="searchValue"
										id="record-search"
										type="text"
										class="input-box !rounded-full !pl-11"
										:placeholder="searchablePlaceholder" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			<Table
				v-if="!store.isFetching"
				:key="tableKey"
				:tableConfig="tableConfig"
				@refresh-records="refreshRecordsHandle()"
				@drag-change="reorderTableTdVisible($event)"
				@sort-data="sortHandler($event, tableConfig, fetchNewPage)" />

			<TableSkeleton v-else />
			<!-- <TableSkeleton /> -->

			<footer class="flex items-center justify-between py-2">
				<UiPagination
					:key="paginationKey"
					:totalPages="store.totalPages"
					:currentPage="store.currentPage"
					@change="navigateToPage($event)" />
			</footer>
		</div>
	</div>
</template>
