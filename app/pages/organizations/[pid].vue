<script setup>
	import {
		roles,
		tab_headers,
		config as headers,
	} from "@/table_configs/organization.json";

	definePageMeta({
		middleware: "admin-or-super-admin",
	});

	const isLoaded = ref(false);
	const error = ref(null);

	const id = ref(null);
	const route = useRoute();
	const composable = await import("~/composables/useOrganization");

	const store = useOrganizationStore();
	const { currRecord } = composable.useOrganization();

	if (route.params?.id) id.value = route.params?.id;

	const table = useTableDefinition({
		read: false,
		write: false,

		tableName: {
			singular: "Organization",
			plural: "Organizations",
		},

		store: useOrganizationStore,

		headers,
		tab_headers,

		rowMap: new Map(),
		groupMap: new Map(),

		hideComposable: composable.useOrganizationHideDropDown,
		groupComposable: composable.useOrganizationGroup,
		currentRecord: composable.useOrganization,

		defaultSort: null,
		drawerComponent: "SideDrawerOrganization",
	});

	onBeforeMount(() => {
		setTableRules(table, roles);
	});

	onMounted(async () => {
		try {
			if (id.value) {
				currRecord.value = await store.findById(id.value);
			}
			isLoaded.value = true;
		} catch (err) {
			error.value = err;
		}
	});
</script>

<template>
	<SkeletonOverview v-if="!isLoaded && !error" />
	<TableOverview v-else-if="isLoaded && !error" :tableConfig="table" />
	<div v-else class="ml-4 mt-4">No record found!</div>
</template>
