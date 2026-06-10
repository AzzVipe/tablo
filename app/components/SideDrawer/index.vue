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
			label: key.toUpperCase(),
			value: value.type,
			data: value,
		}));

	const selected = computed({
		get() {
			return route.query.tab || items[0]?.value;
		},

		set(value) {
			activeTab.value = value;
			const query = filterTableState(tableState.value, store.currentPage, {
				rowId: route.query?.rowId,
				tab: value,
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
	<USlideover v-model:open="drawer">
		<template v-if="currRecord" #content>
			<div class="h-screen overflow-y-auto w-full">
				<!-- Custom Header Slot -->
				<slot name="header" />

				<!-- Tabs -->
				<UTabs
					:items="items"
					v-model="selected"
					:ui="{
						list: 'flex flex-wrap text-sm font-medium text-center shadow bg-[var(--sidebar-bg)] !h-auto !p-0 rounded-none',
						indicator: 'hidden',
						trigger:
							'w-auto border-b-2 border-transparent data-[state=active]:text-[var(--text-title)] !p-2 rounded-none cursor-pointer',
					}">
					<template #content="{ item }">
						<SideDrawerTabs
							:id="item.value"
							:tab="item.data"
							:tableConfig="tableConfig" />
					</template>
				</UTabs>
			</div>
		</template>
	</USlideover>
</template>
