<script setup>
	const props = defineProps({
		tableConfig: { type: Object, required: true },
	});

	console.log(props.tableConfig);

	const { currentRecord, headers, tab_headers } = props.tableConfig;
	const { currRecord, tableState, activeTab } = currentRecord();

	const route = useRoute();
	const store = props.tableConfig.store();

	const dataCopy = ref(null);
	const editingIndex = ref(null);

	// ---- Tab items ----
	const items = computed(() =>
		Object.entries(tab_headers)
			.filter(([, value]) => value?.read !== false)
			.map(([key, value]) => ({ ...value, name: key }))
	);

	// ---- Selected tab ----
	const selected = computed({
		get() {
			const index = items.value.findIndex(
				(item) => item.type === route.query.tab
			);
			return index === -1 ? 0 : index;
		},
		set(value) {
			const query = filterTableState(tableState.value, store.currentPage, {
				rowId: route.query?.rowId,
				tab: items.value[value].type,
			});
			navigateTo({ path: route.path, query });
		},
	});

	onMounted(() => {
		if (currRecord.value) {
			dataCopy.value = JSON.parse(JSON.stringify(currRecord.value));
		}
	});

	watch(currRecord, (val) => {
		if (val) dataCopy.value = JSON.parse(JSON.stringify(val));
	});

	// ---- Inline edit handlers ----
	const handleRowColumnClick = (index) => {
		editingIndex.value = index;
	};

	const handleColumnEscape = () => {
		editingIndex.value = null;
	};

	const handleColumnUpdate = (changes) => {
		if (!changes || Object.keys(changes).length === 0) return;

		store.updateRecord(currRecord.value.id, changes).then((res) => {
			if (res) {
				dataCopy.value = res;
				currRecord.value = res;
			} else {
				for (const key in changes) {
					setValueByPath(currRecord.value, key, changes[key]);
					setValueByPath(dataCopy.value, key, changes[key]);
				}
			}
		});

		handleColumnEscape();
	};
</script>

<template>
	<div v-if="currRecord" class="flex h-screen w-full gap-4 p-4">
		<!-- Record header card -->

		<div
			class="w-1/2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 flex gap-6 justify-between max-xl:flex-col-reverse items-start">
			<!-- Fields grid -->
			<div class="grid grid-cols-2 max-md:grid-cols-1 gap-x-8 gap-y-4 flex-1">
				<template v-for="(header, hi) in headers" :key="hi">
					<!-- Edit mode -->
					<form
						v-if="editingIndex === `${currRecord.id}-${hi}` && header.editable"
						v-click-outside="handleColumnEscape"
						class="col-span-1"
						@submit.prevent
						autocomplete="off">
						<FormFields
							:data="dataCopy"
							:header="header"
							:config="{ operationType: 'update', hideLabel: false }"
							@update="handleColumnUpdate"
							@keydown.esc="handleColumnEscape">
							<template #label="{ labelFor, label }">
								<label
									:for="labelFor"
									class="tracking-wide font-medium text-[var(--text-subtitle)] flex items-center gap-1.5 mb-1">
									{{ label }}
									<UIcon
										name="ic:round-mode-edit"
										class="w-3 h-3 text-[var(--text-title)]" />
								</label>
							</template>
						</FormFields>
					</form>

					<!-- Read mode -->
					<div
						v-else-if="header.visible"
						class="flex flex-col gap-1 group cursor-pointer"
						@dblclick="handleRowColumnClick(`${currRecord.id}-${hi}`, header)">
						<span
							class="tracking-wide font-medium text-[var(--text-subtitle)] flex items-center gap-1.5">
							{{ header.name }}
							<UIcon
								v-if="header.editable"
								name="ic:round-mode-edit"
								class="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
						</span>

						<div class="text-[var(--table-text)] whitespace-pre-wrap">
							<p
								v-if="
									header.component === 'TableCellsDefault' || !header.component
								">
								{{
									getValueByPath(currRecord, getPathFromHeader(header)) || "—"
								}}
							</p>

							<component
								v-else-if="header.component"
								:is="header.component"
								:index="hi"
								:header="{ ...header, tooltip: false }"
								:recordId="currRecord.id"
								:image="getValueByPath(currRecord, header.image_path)"
								:content="
									header.use_row_data
										? currRecord
										: getValueByPath(currRecord, getPathFromHeader(header))
								" />
						</div>
					</div>
				</template>
			</div>
		</div>

		<!-- Tabs -->
		<div class="w-1/2 flex flex-col overflow-hidden">
			<UTabs
				:items="items"
				v-model="selected"
				:ui="{
					list: {
						base: '!flex flex-wrap border-b border-[var(--card-border)]',
						background: 'bg-transparent',
						height: '!h-auto',
						padding: '!p-0',
						rounded: 'rounded-none',
						marker: { base: 'hidden' },
						tab: {
							base: '!w-auto border-b-2 border-transparent transition-colors',
							padding: '!px-4 !py-3',
							rounded: 'rounded-none',
							active: '!border-[var(--text-title)] !text-[var(--text-title)]',
							inactive:
								'!text-[var(--stone-300)] hover:!text-[var(--text-description)]',
						},
					},
				}">
				<template #default="{ item, selected: isSelected }">
					<button
						@click="activeTab = item.type"
						class="text-xs font-medium uppercase tracking-wider focus:outline-none"
						:class="
							isSelected
								? 'text-[var(--text-title)]'
								: 'text-[var(--stone-300)]'
						">
						{{ item.name?.replace(/_/g, " ") }}
					</button>
				</template>

				<template #item="{ item }">
					<SideDrawerTabs
						:tab="item"
						:id="item.type"
						:tableConfig="tableConfig" />
				</template>
			</UTabs>
		</div>
	</div>
</template>
