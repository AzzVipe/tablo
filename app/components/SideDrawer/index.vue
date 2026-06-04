<script setup>
	const { tableConfig } = defineProps({
		tableConfig: {
			type: Object,
			required: true,
		},
	});

	const { currRecord, tableState, drawer, activeTab } =
		tableConfig.currentRecord();

	const store = tableConfig.store();
	const route = useRoute();

	const items = Object.entries(tableConfig.tab_headers)
		.filter(([, value]) => value?.read !== false)
		.map(([key, value]) => ({
			...value,
			name: key,
		}));

	const selected = computed({
		get() {
			const index = items.findIndex((item) => item.type === route.query.tab);
			if (index === -1) {
				return 0;
			}

			return index;
		},
		set(value) {
			const query = filterTableState(tableState.value, store.currentPage, {
				rowId: route.query?.rowId,
				tab: items[value].type,
			});

			navigateTo({
				path: route.path,
				query,
			});
		},
	});

	onBeforeRouteLeave(() => {
		drawer.value = false;
	});
</script>

<template>
	<USlideover
		v-model="drawer"
		:ui="{
			wrapper: '!z-30',
			overlay: { background: 'bg-black/10 backdrop-blur-none' },
			width:
				'!max-w-[45vw] max-2xl:!max-w-[50vw] max-xl:!max-w-[66vw] max-lg:!max-w-[50vw] max-md:!max-w-[55vw] max-sm:!max-w-[80vw]',
		}">
		<div v-if="currRecord" class="h-screen overflow-y-auto w-full">
			<!-- Custom Header Slot -->
			<slot name="header" />

			<!-- Tabs -->
			<UTabs
				:items="items"
				v-model="selected"
				:ui="{
					list: {
						base: '!flex flex-wrap text-sm font-medium text-center shadow',
						background: 'bg-[var(--sidebar-bg)]',
						height: '!h-auto',
						padding: '!p-0',
						rounded: 'rounded-none',
						marker: { base: 'hidden' },
						tab: {
							base: '!w-auto border-b-2 border-transparent !text-[var(--text-description)] hover:text-[var(--text-title)]',
							padding: '!p-5',
							rounded: 'rounded-none',
						},
					},
				}">
				<template #default="{ item, index, selected }">
					<button
						@click="activeTab = item.type"
						class="inline-block uppercase focus:outline-none"
						:class="{ 'text-[var(--text-title)]': selected }">
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
	</USlideover>
</template>
